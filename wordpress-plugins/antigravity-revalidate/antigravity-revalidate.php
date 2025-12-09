<?php
/**
 * Plugin Name: AntiGravity Revalidate
 * Description: Triggers Next.js on-demand revalidation when content is published or updated.
 * Version: 1.0.0
 * Author: AntiGravity
 * License: MIT
 */

if (!defined('ABSPATH')) {
    exit;
}

class AntiGravity_Revalidate {

    private $option_group = 'antigravity_revalidate_options';

    public function __construct() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('transition_post_status', [$this, 'on_post_status_change'], 10, 3);
        add_action('save_post', [$this, 'on_post_save'], 20, 3);
    }

    /**
     * Add settings page to admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            'AntiGravity Revalidate',
            'Revalidation',
            'manage_options',
            'antigravity-revalidate',
            [$this, 'render_settings_page']
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting($this->option_group, 'antigravity_nextjs_url');
        register_setting($this->option_group, 'antigravity_revalidate_secret');
        register_setting($this->option_group, 'antigravity_enable_revalidation');

        add_settings_section(
            'antigravity_revalidate_section',
            'Next.js Revalidation Settings',
            null,
            'antigravity-revalidate'
        );

        add_settings_field(
            'antigravity_enable_revalidation',
            'Enable Revalidation',
            [$this, 'render_enable_field'],
            'antigravity-revalidate',
            'antigravity_revalidate_section'
        );

        add_settings_field(
            'antigravity_nextjs_url',
            'Next.js Site URL',
            [$this, 'render_url_field'],
            'antigravity-revalidate',
            'antigravity_revalidate_section'
        );

        add_settings_field(
            'antigravity_revalidate_secret',
            'Revalidation Secret Token',
            [$this, 'render_secret_field'],
            'antigravity-revalidate',
            'antigravity_revalidate_section'
        );
    }

    public function render_enable_field() {
        $enabled = get_option('antigravity_enable_revalidation', '0');
        ?>
        <label>
            <input type="checkbox" name="antigravity_enable_revalidation" value="1" 
                   <?php checked($enabled, '1'); ?>>
            Enable automatic revalidation on content changes
        </label>
        <?php
    }

    public function render_url_field() {
        $url = get_option('antigravity_nextjs_url', '');
        ?>
        <input type="url" name="antigravity_nextjs_url" value="<?php echo esc_attr($url); ?>" 
               class="regular-text" placeholder="https://your-nextjs-site.com">
        <p class="description">The base URL of your Next.js site (without trailing slash).</p>
        <?php
    }

    public function render_secret_field() {
        $secret = get_option('antigravity_revalidate_secret', '');
        ?>
        <input type="text" name="antigravity_revalidate_secret" value="<?php echo esc_attr($secret); ?>" 
               class="regular-text" placeholder="your-secret-token">
        <p class="description">Must match the REVALIDATION_SECRET in your Next.js .env file.</p>
        <button type="button" class="button" onclick="document.querySelector('[name=antigravity_revalidate_secret]').value = '<?php echo wp_generate_password(32, false); ?>'">
            Generate Token
        </button>
        <?php
    }

    /**
     * Render settings page
     */
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1>AntiGravity Revalidation Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields($this->option_group);
                do_settings_sections('antigravity-revalidate');
                submit_button();
                ?>
            </form>
            
            <hr>
            <h2>Test Revalidation</h2>
            <p>
                <button type="button" class="button button-secondary" id="test-revalidation">
                    Test Connection
                </button>
                <span id="test-result" style="margin-left: 10px;"></span>
            </p>
            
            <script>
            document.getElementById('test-revalidation').addEventListener('click', function() {
                var resultEl = document.getElementById('test-result');
                resultEl.textContent = 'Testing...';
                
                fetch('<?php echo admin_url('admin-ajax.php'); ?>?action=antigravity_test_revalidation')
                    .then(r => r.json())
                    .then(data => {
                        resultEl.textContent = data.success ? '✓ Connection successful!' : '✗ Failed: ' + data.message;
                        resultEl.style.color = data.success ? 'green' : 'red';
                    })
                    .catch(err => {
                        resultEl.textContent = '✗ Error: ' + err.message;
                        resultEl.style.color = 'red';
                    });
            });
            </script>
        </div>
        <?php
    }

    /**
     * Handle post status changes (publish, update, etc.)
     */
    public function on_post_status_change($new_status, $old_status, $post) {
        // Only trigger for publish/update of public post types
        if ($new_status !== 'publish' && $old_status !== 'publish') {
            return;
        }

        $this->trigger_revalidation($post);
    }

    /**
     * Handle post save (for updates to already published posts)
     */
    public function on_post_save($post_id, $post, $update) {
        if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
            return;
        }

        if ($post->post_status !== 'publish') {
            return;
        }

        // Delay to avoid duplicate calls with transition_post_status
        if (did_action('transition_post_status') > 0) {
            return;
        }

        $this->trigger_revalidation($post);
    }

    /**
     * Trigger Next.js revalidation
     */
    private function trigger_revalidation($post) {
        $enabled = get_option('antigravity_enable_revalidation', '0');
        if ($enabled !== '1') {
            return;
        }

        $nextjs_url = get_option('antigravity_nextjs_url', '');
        $secret = get_option('antigravity_revalidate_secret', '');

        if (empty($nextjs_url) || empty($secret)) {
            return;
        }

        // Determine paths to revalidate
        $paths = $this->get_paths_to_revalidate($post);

        foreach ($paths as $path) {
            $this->send_revalidation_request($nextjs_url, $secret, $path);
        }

        // Log the revalidation
        error_log(sprintf(
            '[AntiGravity Revalidate] Triggered revalidation for post ID %d, paths: %s',
            $post->ID,
            implode(', ', $paths)
        ));
    }

    /**
     * Get paths to revalidate for a given post
     */
    private function get_paths_to_revalidate($post) {
        $paths = [];
        $post_type = $post->post_type;
        
        // Get language from taxonomy
        $terms = wp_get_post_terms($post->ID, 'language', ['fields' => 'slugs']);
        $lang = !empty($terms) ? $terms[0] : 'en';

        if ($post_type === 'post') {
            // Blog post - revalidate single post + listing
            $paths[] = "/{$lang}/blog/{$post->post_name}";
            $paths[] = "/{$lang}/blog";
        } elseif ($post_type === 'page') {
            // Page - revalidate by slug
            $paths[] = "/{$lang}/{$post->post_name}";
            
            // If it's the front page
            if ($post->ID === (int) get_option('page_on_front')) {
                $paths[] = "/{$lang}";
            }
        }

        return $paths;
    }

    /**
     * Send revalidation request to Next.js
     */
    private function send_revalidation_request($nextjs_url, $secret, $path) {
        $endpoint = trailingslashit($nextjs_url) . 'api/revalidate';

        $response = wp_remote_post($endpoint, [
            'timeout' => 10,
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode([
                'secret' => $secret,
                'path'   => $path,
            ]),
        ]);

        if (is_wp_error($response)) {
            error_log('[AntiGravity Revalidate] Error: ' . $response->get_error_message());
            return false;
        }

        $code = wp_remote_retrieve_response_code($response);
        return $code === 200;
    }
}

// AJAX handler for test connection
add_action('wp_ajax_antigravity_test_revalidation', function() {
    $nextjs_url = get_option('antigravity_nextjs_url', '');
    $secret = get_option('antigravity_revalidate_secret', '');

    if (empty($nextjs_url) || empty($secret)) {
        wp_send_json(['success' => false, 'message' => 'URL or secret not configured']);
        return;
    }

    $endpoint = trailingslashit($nextjs_url) . 'api/revalidate';
    $response = wp_remote_post($endpoint, [
        'timeout' => 10,
        'headers' => ['Content-Type' => 'application/json'],
        'body'    => json_encode(['secret' => $secret, 'path' => '/test']),
    ]);

    if (is_wp_error($response)) {
        wp_send_json(['success' => false, 'message' => $response->get_error_message()]);
        return;
    }

    $code = wp_remote_retrieve_response_code($response);
    wp_send_json(['success' => $code === 200, 'message' => "HTTP {$code}"]);
});

// Initialize the plugin
new AntiGravity_Revalidate();
