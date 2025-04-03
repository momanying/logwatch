-- 示例数据用于导入ClickHouse表kv_7
-- 使用以下命令导入数据（需要将IP和端口替换为实际值）：
-- cat sample_data.sql | curl 'http://220.181.43.138:8123/?user=test_user&password=Adefault132!' --data-binary @-

-- 注意：这里仅提供几条基本的样例数据，包含了必要的核心字段
-- 在实际导入时，可以根据需要添加更多字段的值

INSERT INTO test_db.kv_7 (
    data_time, 
    write_time, 
    time_hour, 
    id, 
    time, 
    extra, 
    entrance_time, 
    entrance_id, 
    stamp, 
    app_id, 
    platform, 
    user_id, 
    version, 
    build_id, 
    device_id, 
    model, 
    os, 
    os_ver, 
    sdk_ver, 
    category, 
    action, 
    label, 
    state, 
    value,
    d1, d2, d3, d4, d5
) VALUES
-- 页面浏览事件
('2023-07-01 10:15:30', now(), '2023070110', 'ev_001', 1688201730, '{"page":"home"}', 1688201700, 'ent_001', 101, 'doc_app', 'web', 'user_001', '1.0.0', 'build_101', 'device_001', 'Chrome', 'Windows', '10', '1.5.0', 'page', 'view', 'home_page', 'success', 1, 'extra_d1', '', '', '', ''),

('2023-07-01 10:17:45', now(), '2023070110', 'ev_002', 1688201865, '{"page":"documents"}', 1688201700, 'ent_001', 102, 'doc_app', 'web', 'user_001', '1.0.0', 'build_101', 'device_001', 'Chrome', 'Windows', '10', '1.5.0', 'page', 'view', 'documents_page', 'success', 1, '', '', '', '', ''),

('2023-07-01 10:20:12', now(), '2023070110', 'ev_003', 1688202012, '{"page":"editor"}', 1688201700, 'ent_001', 103, 'doc_app', 'web', 'user_001', '1.0.0', 'build_101', 'device_001', 'Chrome', 'Windows', '10', '1.5.0', 'page', 'view', 'editor_page', 'success', 1, '', '', '', '', ''),

-- 文档操作事件
('2023-07-01 10:21:05', now(), '2023070110', 'ev_004', 1688202065, '{"doc_id":"doc_123"}', 1688201700, 'ent_001', 104, 'doc_app', 'web', 'user_001', '1.0.0', 'build_101', 'device_001', 'Chrome', 'Windows', '10', '1.5.0', 'action', 'create', 'new_document', 'success', 1, '', '', '', '', ''),

('2023-07-01 10:25:18', now(), '2023070110', 'ev_005', 1688202318, '{"doc_id":"doc_123"}', 1688201700, 'ent_001', 105, 'doc_app', 'web', 'user_001', '1.0.0', 'build_101', 'device_001', 'Chrome', 'Windows', '10', '1.5.0', 'action', 'edit', 'edit_document', 'success', 1, '', '', '', '', ''),

-- iOS用户事件
('2023-07-01 12:05:23', now(), '2023070112', 'ev_007', 1688208323, '{"page":"home"}', 1688208300, 'ent_002', 201, 'doc_app', 'ios', 'user_002', '1.0.1', 'build_201', 'device_002', 'iPhone', 'iOS', '16.5', '1.5.1', 'page', 'view', 'home_page', 'success', 1, '', '', '', '', ''),

-- Android用户事件
('2023-07-01 14:15:12', now(), '2023070114', 'ev_010', 1688215512, '{"page":"home"}', 1688215500, 'ent_003', 301, 'doc_app', 'android', 'user_003', '1.0.2', 'build_301', 'device_003', 'Samsung', 'Android', '13', '1.5.2', 'page', 'view', 'home_page', 'success', 1, '', '', '', '', ''),

-- Mac用户
('2023-07-01 18:12:45', now(), '2023070118', 'ev_019', 1688229765, '{"page":"home"}', 1688229700, 'ent_007', 701, 'doc_app', 'web', 'user_007', '1.0.0', 'build_101', 'device_007', 'Safari', 'macOS', '13.4', '1.5.0', 'page', 'view', 'home_page', 'success', 1, '', '', '', '', '');

-- 在实际生产环境中，需要提供更多的样例数据，并填写所有必要的字段 