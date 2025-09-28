
-- 插入脚本模板示例数据
INSERT INTO `script_templates` (`id`, `name`, `description`, `category`, `is_active`, `created_at`, `updated_at`) VALUES
('template_product_promo', '产品宣传模板', '适用于产品发布、功能介绍、营销推广等场景的标准化脚本模板。包含产品展示、功能亮点、使用场景和购买引导四个核心环节，帮助用户快速创建专业级产品宣传视频。', '营销推广', 1, 1727481600000, 1727481600000),
('template_education_course', '教学课程模板', '专为在线教育、知识分享、技能培训设计的结构化脚本模板。通过引入问题、知识讲解、案例分析和总结回顾四个步骤，打造逻辑清晰、易于理解的教学内容。', '教育培训', 1, 1727481600000, 1727481600000);

-- 插入模板标签数据
INSERT INTO `script_template_tags` (`template_id`, `tag`) VALUES
('template_product_promo', '产品'),
('template_product_promo', '宣传'),
('template_product_promo', '营销'),
('template_product_promo', '商业'),
('template_education_course', '教育'),
('template_education_course', '课程'),
('template_education_course', '知识'),
('template_education_course', '培训');

-- 插入产品宣传模板节点数据
INSERT INTO `script_template_nodes` (`template_id`, `node_order`, `node_type`, `title`, `text`, `shot_size`, `transition`, `color_style`, `duration`) VALUES
('template_product_promo', 1, 'digital_human', '开场介绍', '大家好，今天为大家介绍一款革命性的产品...', 'medium', 'fade', 'cinematic', 8),
('template_product_promo', 2, 'text2video', '产品亮点展示', '产品核心功能与优势展示，突出解决用户痛点的关键特性', 'wide', 'slide', 'vibrant', 12),
('template_product_promo', 3, 'image2video', '使用场景演示', '真实场景下的产品使用演示，展示实际应用效果', 'close', 'zoom', 'vibrant', 10),
('template_product_promo', 4, 'text2video', '购买引导', '立即行动，享受限时优惠，点击链接了解更多详情', 'medium', 'fade', 'cinematic', 6);

-- 插入教学课程模板节点数据
INSERT INTO `script_template_nodes` (`template_id`, `node_order`, `node_type`, `title`, `text`, `shot_size`, `transition`, `color_style`, `duration`) VALUES
('template_education_course', 1, 'digital_human', '课程引入', '同学们好，今天我们将学习一个重要的知识点...', 'medium', 'fade', 'cinematic', 6),
('template_education_course', 2, 'text2video', '问题引入', '通过实际案例引出问题，激发学习兴趣', 'wide', 'slide', 'moody', 8),
('template_education_course', 3, 'text2video', '知识讲解', '系统讲解核心概念、原理和方法，配合图表说明', 'wide', 'slide', 'moody', 15),
('template_education_course', 4, 'image2video', '案例分析', '通过具体案例演示知识点的实际应用', 'close', 'zoom', 'cinematic', 10),
('template_education_course', 5, 'digital_human', '总结回顾', '今天我们学习了...，希望大家掌握这些要点', 'medium', 'fade', 'cinematic', 6);
