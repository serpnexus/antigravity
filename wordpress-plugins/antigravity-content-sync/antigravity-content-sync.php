<?php
/**
 * Plugin Name: AntiGravity Content Sync
 * Description: Comprehensive content management for headless WordPress with multi-language support, 
 *              SEO metadata, schema selection, and auto-translation key generation.
 * Version: 1.0.0
 * Author: AntiGravity
 * License: MIT
 */

if (!defined('ABSPATH')) {
    exit;
}

class AntiGravity_Content_Sync {

    private $languages = ['en', 'es', 'fr', 'de'];
    
    private $schema_types = [
        'Article' => 'Article',
        'BlogPosting' => 'Blog Post',
        'NewsArticle' => 'News Article', 
        'Organization' => 'Organization',
        'SoftwareApplication' => 'Software/Tool',
        'WebPage' => 'Web Page',
        'FAQPage' => 'FAQ Page',
        'HowTo' => 'How-To Guide',
        'Product' => 'Product',
        'LocalBusiness' => 'Local Business',
    ];

    public function __construct() {
        add_action('init', [$this, 'register_post_types']);
        add_action('add_meta_boxes', [$this, 'add_meta_boxes']);
        add_action('save_post', [$this, 'save_meta_data']);
        add_action('rest_api_init', [$this, 'register_rest_endpoints']);
        add_action('graphql_register_types', [$this, 'register_graphql_fields']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);
    }

    /**
     * Register custom post types for managed content
     */
    public function register_post_types() {
        // Tool Pages CPT
        register_post_type('ag_tool', [
            'labels' => [
                'name' => 'Tools',
                'singular_name' => 'Tool',
                'add_new' => 'Add New Tool',
                'add_new_item' => 'Add New Tool',
                'edit_item' => 'Edit Tool',
                'view_item' => 'View Tool',
                'all_items' => 'All Tools',
                'search_items' => 'Search Tools',
            ],
            'public' => true,
            'has_archive' => true,
            'show_in_rest' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'tool',
            'graphql_plural_name' => 'tools',
            'supports' => ['title', 'editor', 'thumbnail', 'excerpt'],
            'menu_icon' => 'dashicons-hammer',
            'rewrite' => ['slug' => 'tools'],
        ]);

        // Static Pages CPT (about, contact, privacy, write-for-us)
        register_post_type('ag_page', [
            'labels' => [
                'name' => 'Managed Pages',
                'singular_name' => 'Managed Page',
                'add_new' => 'Add New Page',
                'add_new_item' => 'Add New Managed Page',
                'edit_item' => 'Edit Managed Page',
                'view_item' => 'View Managed Page',
                'all_items' => 'All Managed Pages',
                'search_items' => 'Search Managed Pages',
            ],
            'public' => true,
            'has_archive' => false,
            'show_in_rest' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'managedPage',
            'graphql_plural_name' => 'managedPages',
            'supports' => ['title', 'editor', 'thumbnail'],
            'menu_icon' => 'dashicons-admin-page',
        ]);
    }

    /**
     * Add meta boxes for SEO, Schema, and Multi-language content
     */
    public function add_meta_boxes() {
        $post_types = ['ag_tool', 'ag_page', 'post', 'page'];
        
        foreach ($post_types as $post_type) {
            add_meta_box(
                'ag_seo_meta',
                'SEO Settings',
                [$this, 'render_seo_meta_box'],
                $post_type,
                'normal',
                'high'
            );

            add_meta_box(
                'ag_schema_meta',
                'Schema Settings',
                [$this, 'render_schema_meta_box'],
                $post_type,
                'side',
                'default'
            );

            add_meta_box(
                'ag_multilang_meta',
                'Multi-Language Content',
                [$this, 'render_multilang_meta_box'],
                $post_type,
                'normal',
                'high'
            );
        }
    }

    /**
     * Render SEO meta box
     */
    public function render_seo_meta_box($post) {
        wp_nonce_field('ag_content_sync_nonce', 'ag_content_sync_nonce');
        
        $seo_title = get_post_meta($post->ID, '_ag_seo_title', true);
        $seo_description = get_post_meta($post->ID, '_ag_seo_description', true);
        $seo_canonical = get_post_meta($post->ID, '_ag_seo_canonical', true);
        $seo_keywords = get_post_meta($post->ID, '_ag_seo_keywords', true);
        $og_image = get_post_meta($post->ID, '_ag_og_image', true);
        ?>
        <table class="form-table">
            <tr>
                <th><label for="ag_seo_title">SEO Title</label></th>
                <td>
                    <input type="text" id="ag_seo_title" name="ag_seo_title" 
                           value="<?php echo esc_attr($seo_title); ?>" class="large-text">
                    <p class="description">Leave empty to use post title. Recommended: 50-60 characters.</p>
                </td>
            </tr>
            <tr>
                <th><label for="ag_seo_description">Meta Description</label></th>
                <td>
                    <textarea id="ag_seo_description" name="ag_seo_description" 
                              rows="3" class="large-text"><?php echo esc_textarea($seo_description); ?></textarea>
                    <p class="description">Recommended: 150-160 characters.</p>
                </td>
            </tr>
            <tr>
                <th><label for="ag_seo_keywords">Keywords</label></th>
                <td>
                    <input type="text" id="ag_seo_keywords" name="ag_seo_keywords" 
                           value="<?php echo esc_attr($seo_keywords); ?>" class="large-text">
                    <p class="description">Comma-separated keywords.</p>
                </td>
            </tr>
            <tr>
                <th><label for="ag_seo_canonical">Canonical URL Override</label></th>
                <td>
                    <input type="url" id="ag_seo_canonical" name="ag_seo_canonical" 
                           value="<?php echo esc_attr($seo_canonical); ?>" class="large-text">
                    <p class="description">Leave empty for automatic canonical URL.</p>
                </td>
            </tr>
            <tr>
                <th><label for="ag_og_image">OG Image URL</label></th>
                <td>
                    <input type="url" id="ag_og_image" name="ag_og_image" 
                           value="<?php echo esc_attr($og_image); ?>" class="large-text">
                    <p class="description">Social sharing image. Leave empty to use featured image.</p>
                </td>
            </tr>
        </table>
        <?php
    }

    /**
     * Render Schema meta box
     */
    public function render_schema_meta_box($post) {
        $schema_type = get_post_meta($post->ID, '_ag_schema_type', true) ?: 'WebPage';
        ?>
        <p>
            <label for="ag_schema_type"><strong>Schema Type:</strong></label>
            <select id="ag_schema_type" name="ag_schema_type" style="width: 100%; margin-top: 5px;">
                <?php foreach ($this->schema_types as $value => $label) : ?>
                    <option value="<?php echo esc_attr($value); ?>" 
                            <?php selected($schema_type, $value); ?>>
                        <?php echo esc_html($label); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </p>
        <p class="description">
            Select the structured data type for this content. This affects how search engines understand your page.
        </p>
        <?php
    }

    /**
     * Render Multi-language content meta box
     */
    public function render_multilang_meta_box($post) {
        ?>
        <div class="ag-multilang-tabs">
            <div class="ag-tab-nav" style="display: flex; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                <?php foreach ($this->languages as $index => $lang) : ?>
                    <button type="button" class="button ag-tab-btn <?php echo $index === 0 ? 'button-primary' : ''; ?>" 
                            data-lang="<?php echo esc_attr($lang); ?>">
                        <?php echo strtoupper($lang); ?>
                    </button>
                <?php endforeach; ?>
            </div>
            
            <?php foreach ($this->languages as $index => $lang) : 
                $title = get_post_meta($post->ID, "_ag_title_{$lang}", true);
                $description = get_post_meta($post->ID, "_ag_description_{$lang}", true);
                $content = get_post_meta($post->ID, "_ag_content_{$lang}", true);
                $seo_title = get_post_meta($post->ID, "_ag_seo_title_{$lang}", true);
                $seo_desc = get_post_meta($post->ID, "_ag_seo_desc_{$lang}", true);
            ?>
                <div class="ag-tab-content" data-lang="<?php echo esc_attr($lang); ?>" 
                     style="<?php echo $index !== 0 ? 'display: none;' : ''; ?>">
                    <h4 style="margin-top: 0;"><?php echo strtoupper($lang); ?> Content</h4>
                    
                    <table class="form-table">
                        <tr>
                            <th><label>Title (<?php echo strtoupper($lang); ?>)</label></th>
                            <td>
                                <input type="text" name="ag_title_<?php echo $lang; ?>" 
                                       value="<?php echo esc_attr($title); ?>" class="large-text">
                            </td>
                        </tr>
                        <tr>
                            <th><label>Short Description</label></th>
                            <td>
                                <textarea name="ag_description_<?php echo $lang; ?>" 
                                          rows="2" class="large-text"><?php echo esc_textarea($description); ?></textarea>
                            </td>
                        </tr>
                        <tr>
                            <th><label>Full Content</label></th>
                            <td>
                                <?php 
                                wp_editor($content, "ag_content_{$lang}", [
                                    'textarea_name' => "ag_content_{$lang}",
                                    'textarea_rows' => 10,
                                    'media_buttons' => true,
                                ]);
                                ?>
                            </td>
                        </tr>
                        <tr>
                            <th><label>SEO Title (<?php echo strtoupper($lang); ?>)</label></th>
                            <td>
                                <input type="text" name="ag_seo_title_<?php echo $lang; ?>" 
                                       value="<?php echo esc_attr($seo_title); ?>" class="large-text">
                            </td>
                        </tr>
                        <tr>
                            <th><label>SEO Description (<?php echo strtoupper($lang); ?>)</label></th>
                            <td>
                                <textarea name="ag_seo_desc_<?php echo $lang; ?>" 
                                          rows="2" class="large-text"><?php echo esc_textarea($seo_desc); ?></textarea>
                            </td>
                        </tr>
                    </table>
                </div>
            <?php endforeach; ?>
        </div>
        
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            const tabBtns = document.querySelectorAll('.ag-tab-btn');
            const tabContents = document.querySelectorAll('.ag-tab-content');
            
            tabBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const lang = this.dataset.lang;
                    
                    tabBtns.forEach(b => b.classList.remove('button-primary'));
                    this.classList.add('button-primary');
                    
                    tabContents.forEach(content => {
                        content.style.display = content.dataset.lang === lang ? 'block' : 'none';
                    });
                });
            });
        });
        </script>
        <?php
    }

    /**
     * Save meta data
     */
    public function save_meta_data($post_id) {
        if (!isset($_POST['ag_content_sync_nonce']) || 
            !wp_verify_nonce($_POST['ag_content_sync_nonce'], 'ag_content_sync_nonce')) {
            return;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        // Save SEO fields
        $seo_fields = ['ag_seo_title', 'ag_seo_description', 'ag_seo_canonical', 'ag_seo_keywords', 'ag_og_image'];
        foreach ($seo_fields as $field) {
            if (isset($_POST[$field])) {
                update_post_meta($post_id, '_' . $field, sanitize_text_field($_POST[$field]));
            }
        }

        // Save schema type
        if (isset($_POST['ag_schema_type'])) {
            update_post_meta($post_id, '_ag_schema_type', sanitize_text_field($_POST['ag_schema_type']));
        }

        // Save multi-language content
        foreach ($this->languages as $lang) {
            $fields = [
                "ag_title_{$lang}" => "_ag_title_{$lang}",
                "ag_description_{$lang}" => "_ag_description_{$lang}",
                "ag_content_{$lang}" => "_ag_content_{$lang}",
                "ag_seo_title_{$lang}" => "_ag_seo_title_{$lang}",
                "ag_seo_desc_{$lang}" => "_ag_seo_desc_{$lang}",
            ];

            foreach ($fields as $post_key => $meta_key) {
                if (isset($_POST[$post_key])) {
                    $value = $post_key === "ag_content_{$lang}" 
                        ? wp_kses_post($_POST[$post_key])
                        : sanitize_text_field($_POST[$post_key]);
                    update_post_meta($post_id, $meta_key, $value);
                }
            }
        }

        // Generate and save translation keys
        $this->generate_translation_keys($post_id);
    }

    /**
     * Generate translation keys from content
     * e.g., "This is heading H2" -> "this-is-heading-h2"
     */
    private function generate_translation_keys($post_id) {
        $keys = [];
        
        foreach ($this->languages as $lang) {
            $content = get_post_meta($post_id, "_ag_content_{$lang}", true);
            if (empty($content)) continue;

            // Parse content for headings, paragraphs, etc.
            $parsed = $this->parse_content_for_keys($content, $lang);
            $keys[$lang] = $parsed;
        }

        update_post_meta($post_id, '_ag_translation_keys', json_encode($keys));
    }

    /**
     * Parse HTML content and extract translation keys
     */
    private function parse_content_for_keys($html, $lang) {
        $keys = [];
        
        // Match headings (h1-h6), paragraphs, spans, etc.
        $patterns = [
            'h1' => '/<h1[^>]*>(.*?)<\/h1>/is',
            'h2' => '/<h2[^>]*>(.*?)<\/h2>/is',
            'h3' => '/<h3[^>]*>(.*?)<\/h3>/is',
            'h4' => '/<h4[^>]*>(.*?)<\/h4>/is',
            'h5' => '/<h5[^>]*>(.*?)<\/h5>/is',
            'h6' => '/<h6[^>]*>(.*?)<\/h6>/is',
            'p' => '/<p[^>]*>(.*?)<\/p>/is',
            'li' => '/<li[^>]*>(.*?)<\/li>/is',
            'span' => '/<span[^>]*data-key[^>]*>(.*?)<\/span>/is',
        ];

        foreach ($patterns as $tag => $pattern) {
            preg_match_all($pattern, $html, $matches);
            
            foreach ($matches[1] as $text) {
                $stripped = strip_tags($text);
                $stripped = trim($stripped);
                
                if (empty($stripped) || strlen($stripped) < 3) continue;
                
                $key = $this->text_to_key($stripped);
                $keys[$key] = [
                    'tag' => $tag,
                    'content' => $stripped,
                ];
            }
        }

        return $keys;
    }

    /**
     * Convert text to translation key
     * "This is Heading H2" -> "this-is-heading-h2"
     */
    private function text_to_key($text) {
        $key = strtolower($text);
        $key = preg_replace('/[^a-z0-9\s-]/', '', $key);
        $key = preg_replace('/\s+/', '-', $key);
        $key = preg_replace('/-+/', '-', $key);
        $key = trim($key, '-');
        
        // Limit key length
        if (strlen($key) > 50) {
            $key = substr($key, 0, 50);
            $key = preg_replace('/-[^-]*$/', '', $key);
        }
        
        return $key;
    }

    /**
     * Register REST API endpoints
     */
    public function register_rest_endpoints() {
        // Get page/tool by slug with locale
        register_rest_route('antigravity/v1', '/content/(?P<type>[a-z_]+)/(?P<slug>[a-z0-9-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_content_by_slug'],
            'permission_callback' => '__return_true',
            'args' => [
                'locale' => [
                    'default' => 'en',
                    'validate_callback' => function($param) {
                        return in_array($param, $this->languages);
                    }
                ]
            ]
        ]);

        // Get all content for sitemap
        register_rest_route('antigravity/v1', '/sitemap', [
            'methods' => 'GET',
            'callback' => [$this, 'get_sitemap_data'],
            'permission_callback' => '__return_true',
        ]);

        // Get translation keys
        register_rest_route('antigravity/v1', '/translations/(?P<slug>[a-z0-9-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_translation_keys'],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * REST: Get content by slug
     */
    public function get_content_by_slug($request) {
        $type = $request->get_param('type');
        $slug = $request->get_param('slug');
        $locale = $request->get_param('locale') ?: 'en';

        $post_type = $type === 'tool' ? 'ag_tool' : 'ag_page';

        $posts = get_posts([
            'post_type' => $post_type,
            'name' => $slug,
            'posts_per_page' => 1,
        ]);

        if (empty($posts)) {
            return new WP_Error('not_found', 'Content not found', ['status' => 404]);
        }

        $post = $posts[0];
        return $this->format_content_response($post, $locale);
    }

    /**
     * Format content response
     */
    private function format_content_response($post, $locale) {
        $featured_image = get_the_post_thumbnail_url($post->ID, 'full');
        
        return [
            'id' => $post->ID,
            'slug' => $post->post_name,
            'type' => $post->post_type,
            'locale' => $locale,
            'title' => get_post_meta($post->ID, "_ag_title_{$locale}", true) ?: $post->post_title,
            'description' => get_post_meta($post->ID, "_ag_description_{$locale}", true) ?: get_the_excerpt($post),
            'content' => get_post_meta($post->ID, "_ag_content_{$locale}", true) ?: $post->post_content,
            'featuredImage' => $featured_image,
            'seo' => [
                'title' => get_post_meta($post->ID, "_ag_seo_title_{$locale}", true) 
                          ?: get_post_meta($post->ID, '_ag_seo_title', true),
                'description' => get_post_meta($post->ID, "_ag_seo_desc_{$locale}", true)
                                ?: get_post_meta($post->ID, '_ag_seo_description', true),
                'canonical' => get_post_meta($post->ID, '_ag_seo_canonical', true),
                'keywords' => get_post_meta($post->ID, '_ag_seo_keywords', true),
                'ogImage' => get_post_meta($post->ID, '_ag_og_image', true) ?: $featured_image,
            ],
            'schema' => [
                'type' => get_post_meta($post->ID, '_ag_schema_type', true) ?: 'WebPage',
            ],
            'translationKeys' => json_decode(get_post_meta($post->ID, '_ag_translation_keys', true), true),
            'availableLocales' => $this->get_available_locales($post->ID),
            'modified' => $post->post_modified,
        ];
    }

    /**
     * Get available locales for a post
     */
    private function get_available_locales($post_id) {
        $available = [];
        foreach ($this->languages as $lang) {
            $content = get_post_meta($post_id, "_ag_content_{$lang}", true);
            if (!empty($content)) {
                $available[] = $lang;
            }
        }
        return $available;
    }

    /**
     * REST: Get sitemap data
     */
    public function get_sitemap_data() {
        $data = [
            'tools' => [],
            'pages' => [],
            'posts' => [],
        ];

        // Get tools
        $tools = get_posts(['post_type' => 'ag_tool', 'posts_per_page' => -1]);
        foreach ($tools as $tool) {
            $data['tools'][] = [
                'slug' => $tool->post_name,
                'modified' => $tool->post_modified,
                'locales' => $this->get_available_locales($tool->ID),
            ];
        }

        // Get managed pages
        $pages = get_posts(['post_type' => 'ag_page', 'posts_per_page' => -1]);
        foreach ($pages as $page) {
            $data['pages'][] = [
                'slug' => $page->post_name,
                'modified' => $page->post_modified,
                'locales' => $this->get_available_locales($page->ID),
            ];
        }

        // Get blog posts
        $posts = get_posts(['post_type' => 'post', 'posts_per_page' => -1]);
        foreach ($posts as $post) {
            $data['posts'][] = [
                'slug' => $post->post_name,
                'modified' => $post->post_modified,
            ];
        }

        return $data;
    }

    /**
     * REST: Get translation keys
     */
    public function get_translation_keys($request) {
        $slug = $request->get_param('slug');

        $posts = get_posts([
            'post_type' => ['ag_tool', 'ag_page'],
            'name' => $slug,
            'posts_per_page' => 1,
        ]);

        if (empty($posts)) {
            return new WP_Error('not_found', 'Content not found', ['status' => 404]);
        }

        $keys = get_post_meta($posts[0]->ID, '_ag_translation_keys', true);
        return json_decode($keys, true) ?: [];
    }

    /**
     * Register WPGraphQL fields
     */
    public function register_graphql_fields() {
        if (!function_exists('register_graphql_field')) {
            return;
        }

        $post_types = ['Tool', 'ManagedPage', 'Post', 'Page'];

        foreach ($post_types as $type) {
            // SEO fields
            register_graphql_field($type, 'seoMeta', [
                'type' => 'String',
                'description' => 'SEO metadata as JSON',
                'resolve' => function($post) {
                    return json_encode([
                        'title' => get_post_meta($post->ID, '_ag_seo_title', true),
                        'description' => get_post_meta($post->ID, '_ag_seo_description', true),
                        'canonical' => get_post_meta($post->ID, '_ag_seo_canonical', true),
                        'keywords' => get_post_meta($post->ID, '_ag_seo_keywords', true),
                        'ogImage' => get_post_meta($post->ID, '_ag_og_image', true),
                    ]);
                }
            ]);

            // Schema type
            register_graphql_field($type, 'schemaType', [
                'type' => 'String',
                'description' => 'Structured data schema type',
                'resolve' => function($post) {
                    return get_post_meta($post->ID, '_ag_schema_type', true) ?: 'WebPage';
                }
            ]);

            // Multi-language content
            register_graphql_field($type, 'localizedContent', [
                'type' => 'String',
                'description' => 'Localized content as JSON',
                'args' => [
                    'locale' => ['type' => 'String', 'defaultValue' => 'en'],
                ],
                'resolve' => function($post, $args) {
                    $locale = $args['locale'];
                    return json_encode([
                        'title' => get_post_meta($post->ID, "_ag_title_{$locale}", true),
                        'description' => get_post_meta($post->ID, "_ag_description_{$locale}", true),
                        'content' => get_post_meta($post->ID, "_ag_content_{$locale}", true),
                        'seoTitle' => get_post_meta($post->ID, "_ag_seo_title_{$locale}", true),
                        'seoDescription' => get_post_meta($post->ID, "_ag_seo_desc_{$locale}", true),
                    ]);
                }
            ]);
        }
    }

    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts($hook) {
        if ($hook !== 'post.php' && $hook !== 'post-new.php') {
            return;
        }

        wp_add_inline_style('wp-admin', '
            .ag-multilang-tabs .form-table th {
                width: 150px;
                padding: 10px 0;
            }
            .ag-multilang-tabs .form-table td {
                padding: 10px 0;
            }
        ');
    }
}

// Initialize the plugin
new AntiGravity_Content_Sync();
