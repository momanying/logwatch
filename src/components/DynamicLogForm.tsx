import React from 'react';
import teaComponent from '../mock-tea-component-fixed';

const { Form, Card, Checkbox, Text } = teaComponent;

interface DynamicLogFormProps {
  data: any;
  onFieldSelect: (fieldKeys: string[]) => void;
  selectedFields: string[];
}

// 预定义UI中显示的数据库字段，按照新图片中的顺序
const uiFieldsList = [
  { key: "date", label: "date", checked: true },
  { key: "level", label: "level", checked: false },
  { key: "id", label: "id", checked: true },
  { key: "sessionId", label: "sessionId", checked: false },
  { key: "aid", label: "aid", checked: false },
  { key: "msg", label: "msg", checked: true },
  { key: "domain", label: "domain", checked: false },
  { key: "origin", label: "origin", checked: false },
  { key: "model", label: "model", checked: false },
  { key: "deviceId", label: "deviceId", checked: false },
  { key: "platform", label: "platform", checked: false },
  { key: "os", label: "os", checked: false },
  { key: "osVer", label: "osVer", checked: false },
  { key: "version", label: "version", checked: false },
  { key: "sdkVer", label: "sdkVer", checked: false },
  { key: "country", label: "country", checked: false },
  { key: "province", label: "province", checked: false },
  { key: "city", label: "city", checked: false },
  { key: "isp", label: "isp", checked: false },
  { key: "ip", label: "ip", checked: false }
];

// 根据实际数据调整数据库字段映射
const dbFieldMapping = {
  "date": "data_time",
  "id": "id",
  "sessionId": "entrance_id",
  "level": "category",
  "msg": "d1",
  "domain": "d2",
  "origin": "d3",
  "country": "d37",
  "province": "d40",
  "city": "d38",
  "isp": "d39",
  "ip": "d36",
  "platform": "platform",
  "os": "os",
  "osVer": "os_ver",
  "model": "model",
  "deviceId": "device_id",
  "version": "version",
  "sdkVer": "sdk_ver",
  "aid": "app_id"
};

const DynamicLogForm: React.FC<DynamicLogFormProps> = ({ data, onFieldSelect, selectedFields }) => {
  // 将UI字段转换为数据库字段
  const mapUIToDB = (uiField: string): string => {
    return dbFieldMapping[uiField] || uiField;
  };

  // 将数据库字段转换为UI字段
  const mapDBToUI = (dbField: string): string => {
    for (const [ui, db] of Object.entries(dbFieldMapping)) {
      if (db === dbField) return ui;
    }
    return dbField;
  };

  // 处理字段切换
  const handleFieldToggle = (field: string) => {
    const dbField = mapUIToDB(field);
    
    if (selectedFields.includes(dbField)) {
      onFieldSelect(selectedFields.filter(f => f !== dbField));
    } else {
      onFieldSelect([...selectedFields, dbField]);
    }
  };
  
  // 渲染字段选择菜单
  const renderFieldMenu = () => {
    return (
      <div className="field-list-container">
        {uiFieldsList.map(item => {
          const dbField = mapUIToDB(item.key);
          const isChecked = selectedFields.includes(dbField);
          
          return (
            <div key={item.key} className="field-item">
              <Checkbox 
                checked={isChecked} 
                onChange={() => handleFieldToggle(item.key)}
              >
                {item.label}
              </Checkbox>
            </div>
          );
        })}
      </div>
    );
  };
  
  // 全选
  const handleSelectAll = () => {
    const allDbFields = uiFieldsList.map(item => mapUIToDB(item.key));
    onFieldSelect(allDbFields);
  };
  
  // 清除
  const handleClearAll = () => {
    onFieldSelect([]);
  };
  
  // 渲染表单内容
  const renderFormContent = () => {
    return (
      <Card>
        <Card.Body>
          <Form>
            <div className="field-group">
              <div className="field-group-header">
                <Text>字段</Text>
                <div className="field-actions">
                  <Text 
                    theme="primary" 
                    className="select-all-btn"
                    onClick={handleSelectAll}
                  >
                    全选
                  </Text>
                  <Text 
                    theme="primary" 
                    className="clear-btn"
                    onClick={handleClearAll}
                  >
                    清除
                  </Text>
                </div>
              </div>
              {renderFieldMenu()}
            </div>
          </Form>
        </Card.Body>
      </Card>
    );
  };
  
  return (
    <div className="dynamic-log-form">
      {renderFormContent()}
    </div>
  );
};

export default DynamicLogForm; 