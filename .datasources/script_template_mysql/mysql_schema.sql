
-- 脚本模板主表
CREATE TABLE `script_templates` (
  `id` varchar(50) NOT NULL COMMENT '模板唯一标识',
  `name` varchar(255) NOT NULL COMMENT '模板名称',
  `description` text COMMENT '模板描述',
  `category` varchar(100) DEFAULT NULL COMMENT '模板分类',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '是否启用',
  `created_at` bigint NOT NULL COMMENT '创建时间戳',
  `updated_at` bigint NOT NULL COMMENT '更新时间戳',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='脚本模板主表';

-- 模板标签关联表
CREATE TABLE `script_template_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `template_id` varchar(50) NOT NULL COMMENT '模板ID',
  `tag` varchar(100) NOT NULL COMMENT '标签名称',
  PRIMARY KEY (`id`),
  KEY `idx_template_id` (`template_id`),
  KEY `idx_tag` (`tag`),
  FOREIGN KEY (`template_id`) REFERENCES `script_templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模板标签关联表';

-- 模板默认节点配置表
CREATE TABLE `script_template_nodes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `template_id` varchar(50) NOT NULL COMMENT '模板ID',
  `node_order` int NOT NULL COMMENT '节点顺序',
  `node_type` varchar(50) NOT NULL COMMENT '节点类型',
  `title` varchar(255) NOT NULL COMMENT '节点标题',
  `text` text COMMENT '节点文本内容',
  `shot_size` varchar(50) DEFAULT NULL COMMENT '镜头景别',
  `transition` varchar(50) DEFAULT NULL COMMENT '转场效果',
  `color_style` varchar(50) DEFAULT NULL COMMENT '色彩风格',
  `duration` int DEFAULT NULL COMMENT '节点时长(秒)',
  PRIMARY KEY (`id`),
  KEY `idx_template_id` (`template_id`),
  KEY `idx_node_order` (`node_order`),
  FOREIGN KEY (`template_id`) REFERENCES `script_templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模板默认节点配置表';
