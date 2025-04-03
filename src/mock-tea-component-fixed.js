// 修复版本的mock tea-component，解决类型和组件兼容问题
import React from 'react';

// 基础组件
export const Button = ({ type = 'primary', onClick, children, style }) => (
  <button className={`tea-btn tea-btn--${type}`} onClick={onClick} style={style}>
    {children}
  </button>
);

export const Icon = ({ type }) => (
  <i className={`tea-icon tea-icon-${type}`}></i>
);

export const Text = ({ children, theme, style }) => (
  <span className={`tea-text ${theme ? `tea-text--${theme}` : ''}`} style={style}>
    {children}
  </span>
);

export const Input = ({ value, onChange, placeholder }) => (
  <input 
    className="tea-input" 
    value={value} 
    onChange={(e) => onChange && onChange(e.target.value)} 
    placeholder={placeholder} 
  />
);

export const Loading = ({ loading, children }) => (
  <div className="tea-loading">
    {loading && <div className="tea-loading__circle"></div>}
    {children}
  </div>
);

// 表单组件
export const Form = ({ children }) => (
  <div className="tea-form">{children}</div>
);

Form.Item = ({ label, children }) => (
  <div className="tea-form__item">
    {label && <label className="tea-form__label">{label}</label>}
    <div className="tea-form__control">{children}</div>
  </div>
);

// 卡片组件
export const Card = ({ children }) => (
  <div className="tea-card">{children}</div>
);

Card.Body = ({ title, children }) => (
  <div className="tea-card__body">
    {title && <div className="tea-card__title">{title}</div>}
    {children}
  </div>
);

// 表格组件
export const Table = ({ records = [], recordKey, bordered, children }) => {
  // 获取所有列的渲染函数
  const columns = React.Children.toArray(children);
  
  return (
    <table className={`tea-table ${bordered ? 'tea-table--bordered' : ''}`}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index} style={{ width: column.props.width }}>
              {column.props.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map(record => (
          <tr key={recordKey ? record[recordKey] : Math.random()}>
            {columns.map((column, index) => (
              <td key={index}>
                {column.props.render ? column.props.render(record) : record[column.props.dataIndex]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

Table.Column = ({ header, dataIndex, render, width }) => null; // 这只是一个配置组件，不实际渲染

Table.Body = ({ children }) => <tbody>{children}</tbody>;
Table.Row = ({ children }) => <tr>{children}</tr>;
Table.Col = ({ children, width }) => <td style={{ width }}>{children}</td>;

// 选择器组件
export const Select = ({ 
  value, 
  onChange, 
  options = [], 
  type,
  appearance,
  size
}) => (
  <select 
    className={`tea-select tea-select--${size || 'm'} ${type ? `tea-select--${type}` : ''} ${appearance ? `tea-select--${appearance}` : ''}`}
    value={value} 
    onChange={(e) => onChange && onChange(e.target.value)}
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>
        {option.text}
      </option>
    ))}
  </select>
);

// 标签页组件
export const Tabs = ({ tabs = [], activeId, onActive }) => (
  <div className="tea-tabs">
    <ul className="tea-tabs__header">
      {tabs.map(tab => (
        <li
          key={tab.id}
          className={`tea-tabs__item ${activeId === tab.id ? 'tea-tabs__item--active' : ''}`}
          onClick={() => onActive && onActive(tab.id)}
        >
          {tab.label}
        </li>
      ))}
    </ul>
  </div>
);

export const TabPanel = ({ children }) => (
  <div className="tea-tabs__panel">{children}</div>
);

Tabs.TabPanel = TabPanel;

// 日期选择器组件
export const DatePicker = ({ value, onChange, type }) => (
  <div className="tea-datepicker">
    <Input 
      value={Array.isArray(value) ? value.join(' - ') : value} 
      onChange={onChange} 
      placeholder={type === 'datetime' ? 'YYYY-MM-DD HH:MM' : 'YYYY-MM-DD'}
    />
  </div>
);

DatePicker.RangePicker = ({ value, onChange, type }) => (
  <div className="tea-datepicker tea-datepicker--range">
    <Input 
      value={Array.isArray(value) ? value.join(' - ') : ''} 
      onChange={onChange}
      placeholder={type === 'datetime' ? 'YYYY-MM-DD HH:MM - YYYY-MM-DD HH:MM' : 'YYYY-MM-DD - YYYY-MM-DD'}
    />
  </div>
);

// 复选框组件
export const Checkbox = ({ checked, onChange, children }) => (
  <label className="tea-checkbox">
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={(e) => onChange && onChange(e.target.checked)} 
    />
    <span className="tea-checkbox__text">{children}</span>
  </label>
);

// 单选框组件
export const Radio = ({ checked, onChange, children }) => (
  <label className="tea-radio">
    <input 
      type="radio" 
      checked={checked} 
      onChange={(e) => onChange && onChange(e.target.checked)} 
    />
    <span className="tea-radio__text">{children}</span>
  </label>
);

Radio.Group = ({ value, onChange, options = [] }) => (
  <div className="tea-radio-group">
    {options.map(option => (
      <Radio
        key={option.value}
        checked={value === option.value}
        onChange={() => onChange && onChange(option.value)}
      >
        {option.text}
      </Radio>
    ))}
  </div>
);

// 布局组件
export const Row = ({ children, style }) => (
  <div className="tea-row" style={style}>{children}</div>
);

export const Col = ({ children, span, style }) => (
  <div 
    className={`tea-col ${span ? `tea-col-${span}` : ''}`} 
    style={style}
  >
    {children}
  </div>
);

// 布局辅助组件
export const Justify = ({ left, right }) => (
  <div className="tea-justify">
    <div className="tea-justify__left">{left}</div>
    <div className="tea-justify__right">{right}</div>
  </div>
);

// 下拉菜单组件
export const Dropdown = ({ trigger, children }) => (
  <div className="tea-dropdown">
    {trigger}
    <div className="tea-dropdown__menu">{children}</div>
  </div>
);

Dropdown.MenuItem = ({ onClick, children }) => (
  <div className="tea-dropdown__item" onClick={onClick}>
    {children}
  </div>
);

// 对话框组件
export const Dialog = ({ visible, onClose, children }) => {
  if (!visible) return null;
  
  return (
    <div className="tea-dialog">
      <div className="tea-dialog__mask" onClick={onClose}></div>
      <div className="tea-dialog__wrapper">
        <div className="tea-dialog__content">{children}</div>
      </div>
    </div>
  );
};

Dialog.Body = ({ children }) => (
  <div className="tea-dialog__body">{children}</div>
);

Dialog.Footer = ({ children }) => (
  <div className="tea-dialog__footer">{children}</div>
);

// 导出所有组件
export default {
  Button,
  Icon,
  Text,
  Input,
  Loading,
  Form,
  Card,
  Table,
  Select,
  Tabs,
  TabPanel,
  DatePicker,
  Checkbox,
  Radio,
  Row,
  Col,
  Justify,
  Dropdown,
  Dialog
}; 