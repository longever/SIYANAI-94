
-- 创建复合索引优化查询性能
CREATE INDEX `idx_template_category_active` ON `script_templates` (`category`, `is_active`);
CREATE INDEX `idx_template_name` ON `script_templates` (`name`);

-- 为标签表创建复合索引
CREATE INDEX `idx_template_tag_lookup` ON `script_template_tags` (`template_id`, `tag`);

-- 为节点表创建复合索引
CREATE INDEX `idx_template_nodes_lookup` ON `script_template_nodes` (`template_id`, `node_order`);
CREATE INDEX `idx_node_type` ON `script_template_nodes` (`node_type`);
