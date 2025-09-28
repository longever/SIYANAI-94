
-- 常用查询示例

-- 1. 获取所有启用的模板及其标签
SELECT 
  st.id,
  st.name,
  st.description,
  st.category,
  GROUP_CONCAT(stt.tag) as tags
FROM script_templates st
LEFT JOIN script_template_tags stt ON st.id = stt.template_id
WHERE st.is_active = 1
GROUP BY st.id;

-- 2. 获取模板及其所有节点配置
SELECT 
  st.id as template_id,
  st.name as template_name,
  stn.node_order,
  stn.node_type,
  stn.title as node_title,
  stn.text as node_text,
  stn.shot_size,
  stn.transition,
  stn.color_style,
  stn.duration
FROM script_templates st
JOIN script_template_nodes stn ON st.id = stn.template_id
WHERE st.id = 'template_product_promo'
ORDER BY stn.node_order;

-- 3. 按分类搜索模板
SELECT 
  st.*,
  GROUP_CONCAT(stt.tag) as tags
FROM script_templates st
LEFT JOIN script_template_tags stt ON st.id = stt.template_id
WHERE st.category = '营销推广' AND st.is_active = 1
GROUP BY st.id;

-- 4. 按标签搜索模板
SELECT DISTINCT st.*
FROM script_templates st
JOIN script_template_tags stt ON st.id = stt.template_id
WHERE stt.tag IN ('教育', '培训') AND st.is_active = 1;
