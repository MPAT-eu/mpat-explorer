<?php
/*
 * Plugin Name: MPAT Explorer
 * Plugin URI: https://github.com/MPAT-eu/mpat-explorer/
 * Description: Explorer MPAT sites
 * Version: 1.0.2
 * Author: Jean-Claude Dufourd
 * Author URI: https://github.com/MPAT-eu/
 * Text Domain: mpat-explorer
 * Domain Path: /languages
 * License: GPL2
 */

namespace MPAT\Explorer;

class Explorer {

    function general_init() {
      load_plugin_textdomain( 'mpat-explorer', false, basename( dirname( __FILE__ ) ) . '/languages' );
      add_menu_page('MPAT_Explorer', __('Explorer', 'mpat-explorer'), 'manage_mpat_options', 'MPAT_explorer', array(&$this, 'load'), 'dashicons-visibility');
      }

    function load() {
        /* activate WP REST API v2 http://v2.wp-api.org/extending/javascript-client/ */
        wp_enqueue_script('wp-api');
        wp_enqueue_script('mpat-general', plugin_dir_url(__FILE__) . 'build/main.bundle.js', array(), 1.0, true);
        wp_localize_script('mpat-general', 'MPATExplorer', $this->get());
        wp_enqueue_style('mpat-general', plugin_dir_url(__FILE__) . 'explorer.css');
?>
        <div id="insertionPoint">
            <script src="https://d3js.org/d3.v3.js"></script>
            <h2><?php _e('MPAT Explorer', 'mpat-explorer');?> <?php _e('for', 'mpat-explorer');?> <?php echo bloginfo('name'); ?></h2>
            <h4 id="navmodel"><?php _e('Navigation model', 'mpat-explorer'); ?>: </h4>
            <h4 id="pages"><?php _e('Pages', 'mpat-explorer');?>: </h4>
            <h4 id="layouts"><?php _e('Layouts', 'mpat-explorer');?>: </h4>
            <details>
                <summary><?php _e('Page Text Editor', 'mpat-explorer');?></summary>
                <br/>
                <textarea
                        id="mpat-text-editing"
                        title="mpat text editing"
                        class="mpat-text-editing">
                </textarea>
                <br/>
                <?php _e('Get page', 'mpat-explorer');?>: &nbsp;
                <select id="page-id-field" title="page id selector">
                    <option value="0"><?php _e('CHOOSE PAGE', 'mpat-explorer');?></option>
                </select>
                &nbsp;
                <button
                        type="button"
                        id="explorerPutPage"
                        class="mpat-explorer-put-page-button">
                        <?php _e('Put', 'mpat-explorer');?> <?php _e('Page', 'mpat-explorer');?>
                </button>
                <br/>
                <?php _e('Get page', 'mpat-explorer');?> <?php _e('model', 'mpat-explorer');?>: &nbsp;
                <select id="model-id-field" title="model id selector">
                    <option value="0"><?php _e('CHOOSE MODEL', 'mpat-explorer');?></option>
                </select>
                &nbsp;
                <button
                        type="button"
                        id="explorerPutModel"
                        class="mpat-explorer-put-page-button">
                        <?php _e('Put', 'mpat-explorer');?> <?php _e('Model', 'mpat-explorer');?>
                </button>
                <br/>
                <?php _e('Get option', 'mpat-explorer');?>: &nbsp;
                <select id="option-id-field" title="option selector">
                    <option value="0"><?php _e('CHOOSE OPTION', 'mpat-explorer');?></option>
                    <option value="mpat_application_manager"><?php _e('mpat_application_manager', 'mpat-explorer');?></option>
                    <option value="timeline_scenario"><?php _e('timeline_scenario', 'mpat-explorer');?></option>
                    <option value="dsmcc"><?php _e('dsmcc', 'mpat-explorer');?></option>
                    <option value="theme_mods_mpat%2Dtheme"><?php _e('theme_mods_mpat_theme', 'mpat-explorer');?></option>
                </select>
                &nbsp;
                <button
                        type="button"
                        id="explorerPutOption"
                        class="mpat-explorer-put-page-button">
                  <?php _e('Put option', 'mpat-explorer');?>
                </button>
            </details>
            <br/>
            <details>
                <summary><?php _e('Page info with components, links and media', 'mpat-explorer');?></summary>
                <table class="general-table">
                    <thead>
                    <tr>
                        <td><?php _e('Page title', 'mpat-explorer');?> (ID)</td>
                        <td><?php _e('Content', 'mpat-explorer');?></td>
                    </tr>
                    </thead>
                    <tbody id="infoTable"></tbody>
                </table>
            </details>
            <br/>
            <details>
                <summary><?php _e('Layout info with zones', 'mpat-explorer');?></summary>
                <table class="general-table">
                    <thead>
                    <tr>
                        <td><?php _e('Layout name', 'mpat-explorer');?> (ID)</td>
                        <td><?php _e('Used by', 'mpat-explorer');?></td>
                        <td><?php _e('Zones', 'mpat-explorer');?></td>
                        <td><?php _e('Actions', 'mpat-explorer');?></td>
                    </tr>
                    </thead>
                    <tbody id="layoutTable"></tbody>
                </table>
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
      array_push($main, ['timeline_scenario' => $opt]);
    }
    $opt = get_option('dsmcc');
    if ($opt) {
      array_push($main, ['dsmcc' => $opt]);
    }
    $opt = get_option('theme_mods_mpat-theme');
    if ($opt) {
      array_push($main, ['theme_mods_mpat-theme' => $opt]);
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
    $pages = get_posts(array('post_type' => 'page_model'));
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
        "page_model" => $page,
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
    $customcss = get_posts( array( 'post_type' => 'custom_css', 'posts_per_page' => '100' ) );
    foreach ($customcss as $cc) {
      $cc = $cc->to_array();
      array_push($main, array(
          "custom_css" => $cc,
      ));
    }
    return $main;
  }

}

$ge = new Explorer();
add_action("admin_menu", array(&$ge, "general_init"));
