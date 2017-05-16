<?php
/*
 * Plugin Name: MPAT Explorer
 * Plugin URI: https://github.com/jcdufourd/mpat/explorer/
 * Description: Explorer MPAT sites
 * Version: 1.0.beta
 * Author: Jean-Claude Dufourd
 * Author URI: https://github.com/jcdufourd/
 * License: GPL2
 */

namespace MPAT\Explorer;

class Explorer {

    function general_init() {
        add_menu_page('MPAT_Explorer', 'Explorer', 'manage_options', 'MPAT_explorer', array(&$this, 'load'), 'dashicons-visibility');
    }

    static function general_templates() {
        $url_path = trim(parse_url(add_query_arg(array()), PHP_URL_PATH), '/');
        if ( isset($_GET['page']) && strtolower($_GET['page']) === "mpat_explorer" ) {
            $action = isset($_GET['action']) ? $_GET['action'] : "";
            switch ($action) {
                case 'export':
                    header("Content-Type: application/json");
                    $object = Explorer::get();
                    if ( isset($_GET['layoutid']) ) {
                        $layoutId = $_GET['layoutid'];
                        foreach ($object as $o) {
                            if (isset($o['page_layout']) && isset($o['page_layout']['ID']) &&  $o['page_layout']['ID'] == $layoutId) {
                                $filename = ( isset($o["page_layout"]["post_title"]) ? $o["page_layout"]["post_title"] : "$layoutId" );
                                header("Content-disposition: attachment; filename=$filename.mpat-layout");
                                echo json_encode($o);
                                break;
                            }
                        }
                    }
                    else if ( isset($_GET['pageid']) ) {
                        $pageId = $_GET['pageid'];
                        foreach ($object as $o) {
                            if (isset($o['page']) && isset($o['page']['ID']) &&  $o['page']['ID'] == $pageId) {
                                //$u = General::addMedia($o);
                                //TODO: add media properly
                                $filename = ( isset($o["page"]["post_title"]) ? $o["page"]["post_title"] : "$pageId" );
                                header("Content-disposition: attachment; filename=$filename.mpat-page");
                                echo json_encode($o);
                                break;
                            }
                        }
                    }
                    exit();
                    break;
                case 'import':
                    if ( isset($_FILES['layout']) ) {
                        $json = file_get_contents( $_FILES['layout']['tmp_name'] );
                        $layout = json_decode($json, true);
                        $meta = $layout["page_layout"]["meta"]["mpat_content"];
                        $title = $layout["page_layout"]['post_title'];
                        if (($old = get_page_by_title($title, ARRAY_A, "page_layout")) && $old["post_status"] == "publish") {
                            echo "Layout $title already exists\n";
                            exit();
                        }
                        $page = array(
                            'post_type' => 'page_layout',
                            'post_status' => 'publish',
                            'post_slug' => 'page_layout',
                            'post_title' => $title,
                            'meta_input' => $layout["page_layout"]["meta"]
                        );
                        $page_id = wp_insert_post($page);
                        echo "Imported layout $title with id=$page_id\n";
                        echo '<script type="text/javascript">window.top.location.reload();</script>';
                    }
                    else if ( isset($_FILES['page']) ) {
                        $json = file_get_contents( $_FILES['page']['tmp_name'] );
                        $page = json_decode($json, true);
                        $meta = $page["page"]["meta"]["mpat_content"];
                        $title = $page["page"]['post_title'];
                        if (($old = get_page_by_title($title, ARRAY_A, "page")) && $old["post_status"] == "publish") {
                            echo "page $title already exists\n";
                            exit();
                        }
                        // affect the new page to a corresponding layout with the same name as the original if possible
                        if (isset($meta["layout_name"])) {
                            $layout = get_page_by_title($meta["layout_name"], ARRAY_A, "page_layout");
                            if ($layout) {
                                unset($meta["layout_name"]);
                                $meta["layoutId"] = $layout["ID"];
                            }
                        }
                        $new_page = array(
                            'post_type' => 'page',
                            'post_status' => 'publish',
                            'post_slug' => 'page',
                            'post_title' => $title,
                            'meta_input' => array( "mpat_content" => $meta )
                        );
                        $page_id = wp_insert_post($new_page);
                        echo "Imported page $title with id=$page_id\n";
                        echo '<script type="text/javascript">window.top.location.reload();</script>';
                    }
                    exit();
                    break;
                default:
                    break;
            }
        }

    }

    static function addMedia($o) {
        $content = $o['meta']['content'];
        $counter = 0;
        foreach($content as $key => $value ) {
            foreach($value as $stateName => $state) {
                switch ($state['type']) {
                    case 'link':
                        if ($state['data'] && $state['data']['thumbnail']) {
                            $tmp = base64_encode(file_get_contents($state['data']['thumbnail']));
                            $newName = 'media'.$counter++;
                            $o[$newName] = array($state['data']['thumbnail'], $tmp);
                        }
                        break;
                    case 'image':
                        if ($state['data'] && $state['data']['imgUrl']) {
                            $tmp = base64_encode(file_get_contents($state['data']['imgUrl']));
                            $newName = 'media'.$counter++;
                            $o[$newName] = array($state['data']['imgUrl'], $tmp);
                        }
                        break;
                    case 'video':
                        if ($state['data'] && $state['data']['thumbnail']) {
                            $tmp = base64_encode(file_get_contents($state['data']['thumbnail']));
                            $newName = 'media'.$counter++;
                            $o[$newName] = array($state['data']['thumbnail'], $tmp);
                        }
                        if ($state['data'] && $state['data']['url']) {
                            $tmp = base64_encode(file_get_contents($state['data']['url']));
                            $newName = 'media'.$counter++;
                            $o[$newName] = array($state['data']['url'], $tmp);
                        }
                        break;
                    case 'launcher':
                        //TODO
                        break;
                    case 'gallery':
                        //TODO
                        break;
                }
            }
        }
        return $o;
    }


    function load() {
        /* activate WP REST API v2 http://v2.wp-api.org/extending/javascript-client/ */
        wp_enqueue_script('wp-api');
        wp_enqueue_script('mpat-general', plugin_dir_url(__FILE__) . 'mpat_explorer.js', array(), 1.0, true);
        wp_localize_script('mpat-general', 'MPATExplorer', $this->get());
        wp_enqueue_style('mpat-general', plugin_dir_url(__FILE__) . 'explorer.css');
?>
        <div id="insertionPoint">
            <script src="https://d3js.org/d3.v3.js"></script>
            <h2>MPAT Explorer for <?php echo bloginfo('name'); ?></h2>
            <h4 id="navmodel">Navigation model: </h4>
            <h4 id="pages">Pages: </h4>
            <h4 id="layouts">Layouts: </h4>
            <details>
                <summary>Page info with components, links and media (click on title to export)</summary>
                <table class="general-table">
                    <thead>
                    <tr>
                        <td>Page title (ID)</td>
                        <td>Content</td>
                    </tr>
                    </thead>
                    <tbody  id="infoTable"></tbody>
                </table>
                <br />
                <form action="<?php echo $_SERVER['REQUEST_URI'] . '&action=import'; ?>" id="page-form" method="post" enctype="multipart/form-data" target="page-target" >
                    <input id="page-fileinput" type="file" name="page" style="display: none;"  />
                    <div>
                        <button type="button" id="page-btn" style="display:inline;vertical-align:center;">Import new page</button>
                        <iframe id="page-target" name="page-target" scrolling="no" style="width:80%;height:25px;border:0;display:inline;"></iframe>
                    </div>
                </form>
                <script>
                    document.getElementById("page-btn").onclick = function() {
                        document.getElementById("page-fileinput").click();
                    }
                    document.getElementById("page-fileinput").onchange = function() {
                        document.getElementById("page-form").submit();
                        document.getElementById("page-fileinput").value = "";
                    }
                </script>
            </details>
            <br/>
            <details>
                <summary>Layout info with zones (click on title to export)</summary>
                <table class="general-table">
                    <thead>
                    <tr>
                        <td>Layout name (ID)</td>
                        <td>Zones</td>
                    </tr>
                    </thead>
                    <tbody id="layoutTable"></tbody>
                </table>
                <br />
                <form action="<?php echo $_SERVER['REQUEST_URI'] . '&action=import'; ?>"
                      id="layout-form" method="post" enctype="multipart/form-data"
                      target="layout-target" >
                    <input id="layout-fileinput" type="file" name="layout" style="display: none;"  />
                    <div>
                        <button type="button" id="layout-btn" style="display:inline;vertical-align:center;">Import new layout</button>
                        <iframe id="layout-target" name="layout-target" scrolling="no" style="width:80%;height:25px;border:0;display:inline;"></iframe>
                    </div>
                </form>
                <script>
                    document.getElementById("layout-btn").onclick = function() {
                        document.getElementById("layout-fileinput").click();
                    }
                    document.getElementById("layout-fileinput").onchange = function() {
                        document.getElementById("layout-form").submit();
                        document.getElementById("layout-fileinput").value = "";
                    }
                </script>
            </details>
            <br/>
            <details>
                <summary>Explorer the content of a remote MPAT page</summary>
                <div style="margin: 20px;">
                    <p>
                        View the page source of the remote page. Then look for a script containing
                        'MPATGlobalInformation'. Paste the text of that script tag in the text area
                        below and press 'Explore'.
                    </p>
                    <textarea title="t" rows="10" cols="100" id="remoteUrl"></textarea>
                    <br/>
                    <button type="button" onclick="exploreRemoteMPATPage()">Explore</button>
                    <br/>
                    <h5>Layout information:</h5>
                    <blockquote>
                        <pre id="remoteLayout"></pre>
                    </blockquote>
                    <h5>Page information:</h5>
                    <blockquote>
                        <pre id="remotePage"></pre>
                    </blockquote>
                </div>
            </details>
            <br/>
        </div>
<?php
    }

    /*
     * This function gathers all the MPAT specific information into one object and returns it
     */
  static function get() {
    $main = array();
    $opt = get_option('mpat_application_manager');
    if ($opt) {
      array_push($main, ['mpat_application_manager' => $opt]);
    }
    $opt = get_option('timeline_scenario');
    if ($opt) {
      array_push($main, ['timeline_scenario' => json_decode($opt)]);
    }
   $pages = get_pages();
    foreach ($pages as $page) {
        $page = $page->to_array();
        $meta = get_post_meta($page['ID'], 'mpat_content', true);
        if (isset($meta["layoutId"]))
        {
            $layout = get_post( $meta["layoutId"] );
            if ($layout && $layout->post_type == "page_layout") {
                $meta["layout_name"] = $layout->post_title;
            }
        }
        $page['meta'] = array('mpat_content' => $meta);
        array_push($main, array(
            "page" => $page,
        ));
    }
    $layouts = get_posts( array( 'post_type' => 'page_layout', 'posts_per_page' => '100' ) );
    foreach ($layouts as $layout) {
        $layout = $layout->to_array();
        if ($layout['post_status'] == 'publish') {
            $meta = get_post_meta($layout['ID'], 'mpat_content', true);
            $layout['meta'] = array('mpat_content' => $meta);
            array_push($main, array(
                "page_layout" => $layout,
            ));
        }
    }
    return $main;
  }

}

$ge = new Explorer();
add_action("admin_menu", array(&$ge, "general_init"));
add_action('wp_loaded', array(&$ge, "general_templates"));
