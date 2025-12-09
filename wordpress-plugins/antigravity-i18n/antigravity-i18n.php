<?php
/**
 * Plugin Name: AntiGravity i18n
 * Description: Simple multilingual content management for headless WordPress sites. Adds language taxonomy and translation linking.
 * Version: 1.0.0
 * Author: AntiGravity
 * License: MIT
 */

if (!defined('ABSPATH')) {
    exit;
}

class AntiGravity_i18n {

    private $languages = ['en', 'es', 'fr', 'de'];

    public function __construct() {
        add_action('init', [$this, 'register_language_taxonomy']);
        add_action('add_meta_boxes', [$this, 'add_translation_meta_box']);
        add_action('save_post', [$this, 'save_translation_meta']);
        add_action('rest_api_init', [$this, 'register_rest_fields']);
        
        // WPGraphQL support (if installed)
        add_action('graphql_register_types', [$this, 'register_graphql_fields']);
    }

    /**
     * Register 'language' taxonomy for posts and pages
     */
    public function register_language_taxonomy() {
        $labels = [
            'name'              => 'Languages',
            'singular_name'     => 'Language',
            'search_items'      => 'Search Languages',
            'all_items'         => 'All Languages',
            'edit_item'         => 'Edit Language',
            'update_item'       => 'Update Language',
            'add_new_item'      => 'Add New Language',
            'new_item_name'     => 'New Language Name',
            'menu_name'         => 'Languages',
        ];

        register_taxonomy('language', ['post', 'page'], [
            'hierarchical'      => false,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'rewrite'           => ['slug' => 'language'],
            'show_in_rest'      => true,
            'show_in_graphql'   => true,
            'graphql_single_name' => 'language',
            'graphql_plural_name' => 'languages',
        ]);

        // Create default language terms if they don't exist
        foreach ($this->languages as $lang) {
            if (!term_exists($lang, 'language')) {
                wp_insert_term(strtoupper($lang), 'language', ['slug' => $lang]);
            }
        }
    }

    /**
     * Add meta box for Translation Group ID
     */
    public function add_translation_meta_box() {
        add_meta_box(
            'antigravity_translation_group',
            'Translation Settings',
            [$this, 'render_translation_meta_box'],
            ['post', 'page'],
            'side',
            'high'
        );
    }

    /**
     * Render the translation meta box
     */
    public function render_translation_meta_box($post) {
        wp_nonce_field('antigravity_translation_nonce', 'antigravity_translation_nonce');
        
        $translation_group = get_post_meta($post->ID, '_translation_group_id', true);
        $translations = $this->get_translations($post->ID);
        
        ?>
        <p>
            <label for="translation_group_id"><strong>Translation Group ID:</strong></label><br>
            <input type="text" id="translation_group_id" name="translation_group_id" 
                   value="<?php echo esc_attr($translation_group); ?>" 
                   style="width: 100%;" 
                   placeholder="e.g., about-page">
            <small style="color: #666;">Use the same ID for all translations of this content.</small>
        </p>
        
        <?php if (!empty($translations)) : ?>
        <hr>
        <p><strong>Linked Translations:</strong></p>
        <ul style="margin: 0; padding-left: 20px;">
            <?php foreach ($translations as $trans) : ?>
                <li>
                    <a href="<?php echo get_edit_post_link($trans->ID); ?>">
                        <?php echo esc_html($trans->post_title); ?>
                    </a>
                    <span style="color: #666;">(<?php echo esc_html($this->get_post_language($trans->ID)); ?>)</span>
                </li>
            <?php endforeach; ?>
        </ul>
        <?php endif; ?>
        <?php
    }

    /**
     * Save translation meta
     */
    public function save_translation_meta($post_id) {
        if (!isset($_POST['antigravity_translation_nonce']) || 
            !wp_verify_nonce($_POST['antigravity_translation_nonce'], 'antigravity_translation_nonce')) {
            return;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        if (isset($_POST['translation_group_id'])) {
            update_post_meta($post_id, '_translation_group_id', sanitize_text_field($_POST['translation_group_id']));
        }
    }

    /**
     * Get all translations in the same group
     */
    private function get_translations($post_id) {
        $group_id = get_post_meta($post_id, '_translation_group_id', true);
        
        if (empty($group_id)) {
            return [];
        }

        $args = [
            'post_type'      => get_post_type($post_id),
            'posts_per_page' => -1,
            'post__not_in'   => [$post_id],
            'meta_query'     => [
                [
                    'key'   => '_translation_group_id',
                    'value' => $group_id,
                ]
            ]
        ];

        return get_posts($args);
    }

    /**
     * Get post language
     */
    private function get_post_language($post_id) {
        $terms = wp_get_post_terms($post_id, 'language', ['fields' => 'slugs']);
        return !empty($terms) ? $terms[0] : 'en';
    }

    /**
     * Register REST API fields
     */
    public function register_rest_fields() {
        register_rest_field(['post', 'page'], 'translation_group_id', [
            'get_callback' => function($post) {
                return get_post_meta($post['id'], '_translation_group_id', true);
            },
            'schema' => [
                'description' => 'Translation group identifier',
                'type'        => 'string',
            ],
        ]);

        register_rest_field(['post', 'page'], 'translations', [
            'get_callback' => function($post) {
                $group_id = get_post_meta($post['id'], '_translation_group_id', true);
                if (empty($group_id)) {
                    return [];
                }

                $translations = [];
                $posts = get_posts([
                    'post_type'      => $post['type'],
                    'posts_per_page' => -1,
                    'meta_query'     => [
                        [
                            'key'   => '_translation_group_id',
                            'value' => $group_id,
                        ]
                    ]
                ]);

                foreach ($posts as $p) {
                    $terms = wp_get_post_terms($p->ID, 'language', ['fields' => 'slugs']);
                    $lang = !empty($terms) ? $terms[0] : 'en';
                    $translations[$lang] = [
                        'id'    => $p->ID,
                        'slug'  => $p->post_name,
                        'title' => $p->post_title,
                    ];
                }

                return $translations;
            },
            'schema' => [
                'description' => 'Linked translations',
                'type'        => 'object',
            ],
        ]);

        // Custom endpoint to get posts by language
        register_rest_route('antigravity/v1', '/posts/(?P<lang>[a-z]{2})', [
            'methods'  => 'GET',
            'callback' => [$this, 'get_posts_by_language'],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * REST endpoint: Get posts by language
     */
    public function get_posts_by_language($request) {
        $lang = $request->get_param('lang');
        
        $args = [
            'post_type'      => 'post',
            'posts_per_page' => 20,
            'tax_query'      => [
                [
                    'taxonomy' => 'language',
                    'field'    => 'slug',
                    'terms'    => $lang,
                ]
            ]
        ];

        $posts = get_posts($args);
        $result = [];

        foreach ($posts as $post) {
            $result[] = [
                'id'      => $post->ID,
                'slug'    => $post->post_name,
                'title'   => $post->post_title,
                'excerpt' => get_the_excerpt($post),
                'date'    => $post->post_date,
                'author'  => get_the_author_meta('display_name', $post->post_author),
            ];
        }

        return rest_ensure_response($result);
    }

    /**
     * Register WPGraphQL fields (if WPGraphQL is active)
     */
    public function register_graphql_fields() {
        if (!function_exists('register_graphql_field')) {
            return;
        }

        register_graphql_field('Post', 'translationGroupId', [
            'type'        => 'String',
            'description' => 'Translation group identifier',
            'resolve'     => function($post) {
                return get_post_meta($post->ID, '_translation_group_id', true);
            }
        ]);

        register_graphql_field('Page', 'translationGroupId', [
            'type'        => 'String',
            'description' => 'Translation group identifier',
            'resolve'     => function($post) {
                return get_post_meta($post->ID, '_translation_group_id', true);
            }
        ]);
    }
}

// Initialize the plugin
new AntiGravity_i18n();
