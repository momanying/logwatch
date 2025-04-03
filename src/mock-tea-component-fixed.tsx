import React from 'react';

// 基本属性类型
interface BasicProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  [key: string]: any;
}

// 表格属性
interface TableProps extends BasicProps {
  records?: any[];
  recordKey?: string;
  bordered?: boolean;
}

// 表格列属性
interface ColumnProps extends BasicProps {
  key?: string;
  header?: React.ReactNode;
  width?: number | string;
  render?: (record: any, index: number) => React.ReactNode;
}

// 表格行属性
interface RowProps extends BasicProps {}

// 表格列单元格属性
interface ColProps extends BasicProps {
  width?: number | string;
}

// 表格组件
class Table extends React.Component<TableProps> {
  static Column = (props: ColumnProps) => <div>{props.children}</div>;
  static Row = (props: RowProps) => <div>{props.children}</div>;
  static Col = (props: ColProps) => <div>{props.children}</div>;
  static Head = (props: BasicProps) => <div>{props.children}</div>;
  static Body = (props: BasicProps) => <div>{props.children}</div>;
  
  render() {
    return <div className="tea-table">{this.props.children}</div>;
  }
}

// 卡片属性
interface CardProps extends BasicProps {}

// 卡片体属性
interface CardBodyProps extends BasicProps {
  title?: React.ReactNode;
}

// 卡片组件
class Card extends React.Component<CardProps> {
  static Body = (props: CardBodyProps) => (
    <div className="tea-card__body">
      {props.title && <div className="tea-card__body-title">{props.title}</div>}
      {props.children}
    </div>
  );
  
  render() {
    return <div className="tea-card">{this.props.children}</div>;
  }
}

// 表单属性
interface FormProps extends BasicProps {}

// 表单项属性
interface FormItemProps extends BasicProps {
  label?: React.ReactNode;
}

// 表单组件
class Form extends React.Component<FormProps> {
  static Item = (props: FormItemProps) => (
    <div className="tea-form__item">
      {props.label && <div className="tea-form__label">{props.label}</div>}
      <div className="tea-form__content">{props.children}</div>
    </div>
  );
  
  render() {
    return <div className="tea-form">{this.props.children}</div>;
  }
}

// 单选框属性
interface RadioProps extends BasicProps {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// 单选框组属性
interface RadioGroupProps extends BasicProps {
  value?: string;
  onChange?: (value: string) => void;
}

// 单选框组件
class Radio extends React.Component<RadioProps> {
  static Group = (props: RadioGroupProps) => (
    <div className="tea-radio-group">{props.children}</div>
  );
  
  render() {
    return (
      <label className="tea-radio">
        <input type="radio" checked={this.props.checked} onChange={this.props.onChange} />
        <span className="tea-radio__text">{this.props.children}</span>
      </label>
    );
  }
}

// 复选框属性
interface CheckboxProps extends BasicProps {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// 复选框组件
const Checkbox: React.FC<CheckboxProps> = (props) => (
  <label className="tea-checkbox">
    <input type="checkbox" checked={props.checked} onChange={props.onChange} />
    <span className="tea-checkbox__text">{props.children}</span>
  </label>
);

// 下拉选择属性
interface SelectProps extends BasicProps {
  options?: Array<{value: string, text: string}>;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  type?: 'default' | 'simulate';
  size?: 'm' | 'l' | 'full';
  appearance?: 'default' | 'button';
}

// 下拉选择组件
const Select: React.FC<SelectProps> = (props) => (
  <div className="tea-select">
    <select 
      className="tea-select__control" 
      value={Array.isArray(props.value) ? props.value[0] : props.value || ''}
      onChange={(e) => props.onChange && props.onChange(e.target.value)}
    >
      {props.options?.map(option => (
        <option key={option.value} value={option.value}>{option.text}</option>
      ))}
    </select>
    <span className="tea-select__text">
      {props.value ? 
        (Array.isArray(props.value) && props.value.length > 0 ? 
          props.options?.find(o => o.value === props.value?.[0])?.text : 
          props.options?.find(o => o.value === props.value)?.text) : 
        props.placeholder}
    </span>
  </div>
);

// 输入框属性
interface InputProps extends BasicProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  prefix?: React.ReactNode;
}

// 输入框组件
const Input: React.FC<InputProps> = (props) => (
  <div className="tea-input">
    {props.prefix && <span className="tea-input__prefix">{props.prefix}</span>}
    <input 
      className="tea-input__control" 
      value={props.value} 
      onChange={(e) => props.onChange && props.onChange(e.target.value)}
      placeholder={props.placeholder}
    />
  </div>
);

// 按钮属性
interface ButtonProps extends BasicProps {
  type?: 'primary' | 'weak' | 'link';
  onClick?: () => void;
  icon?: React.ReactNode;
}

// 按钮组件
const Button: React.FC<ButtonProps> = (props) => (
  <button 
    className={`tea-btn tea-btn--${props.type || 'primary'}`} 
    onClick={props.onClick}
  >
    {props.icon && <span className="tea-btn__icon">{props.icon}</span>}
    <span className="tea-btn__text">{props.children}</span>
  </button>
);

// 图标属性
interface IconProps extends BasicProps {
  type: string;
}

// 图标组件
const Icon: React.FC<IconProps> = (props) => (
  <i className={`tea-icon tea-icon-${props.type}`}></i>
);

// 文本属性
interface TextProps extends BasicProps {
  theme?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
}

// 文本组件
const Text: React.FC<TextProps> = (props) => (
  <span className={`tea-text tea-text--${props.theme || 'default'}`}>{props.children}</span>
);

// 标签页属性
interface TabsProps extends BasicProps {
  tabs?: Array<{id: string, label: string}>;
  activeId?: string;
  onActive?: (key: string) => void;
}

// 标签面板属性
interface TabPanelProps extends BasicProps {
  id: string;
  label: string;
}

// 标签页组件
class Tabs extends React.Component<TabsProps> {
  static TabPanel = (props: TabPanelProps) => (
    <div className="tea-tabs__panel">{props.children}</div>
  );
  
  render() {
    return (
      <div className="tea-tabs">
        <div className="tea-tabs__header">
          {this.props.tabs?.map(tab => (
            <div 
              key={tab.id}
              className={`tea-tabs__item ${tab.id === this.props.activeId ? 'tea-tabs__active' : ''}`}
              onClick={() => this.props.onActive && this.props.onActive(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <div className="tea-tabs__content">
          {this.props.children}
        </div>
      </div>
    );
  }
}

// DatePicker 接口定义
interface DatePickerProps {
  value?: string | Date;
  onChange?: (value: string | Date) => void;
  type?: 'date' | 'datetime';
  showTime?: boolean | { format: string };
  format?: string;
  defaultTimeStart?: string;
  defaultTimeEnd?: string;
  bordered?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  style?: React.CSSProperties;
}

// RangePicker 接口定义
interface RangePickerProps {
  value?: [string, string] | [Date, Date] | [];
  onChange?: (value: [string, string] | [Date, Date]) => void;
  type?: 'date' | 'datetime';
  placeholder?: [string, string];
  showTime?: boolean | { format: string };
  format?: string;
  defaultTimeStart?: string;
  defaultTimeEnd?: string;
  bordered?: boolean;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
  style?: React.CSSProperties;
}

// DatePicker组件
const DatePicker = (props: DatePickerProps) => {
  const { value, onChange, placeholder, disabled, className, style, format, showTime, bordered, maxLength } = props;
  
  const handleChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    }
  };
  
  return (
    <div className={`tea-datepicker ${bordered ? 'tea-datepicker--bordered' : ''} ${disabled ? 'tea-datepicker--disabled' : ''}`} style={style}>
      <input
        className="tea-datepicker__input"
        type="text"
        value={typeof value === 'string' ? value : (value instanceof Date ? value.toISOString() : '')}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder || '请选择日期'}
        disabled={disabled}
        maxLength={maxLength || 50}
      />
      <span className="tea-datepicker__icon">📅</span>
      {value && <span className="tea-datepicker__clear" onClick={() => handleChange('')}>✕</span>}
    </div>
  );
};

// RangePicker组件
DatePicker.RangePicker = (props: RangePickerProps) => {
  const { 
    value = [], 
    onChange, 
    placeholder = ['开始日期', '结束日期'], 
    disabled, 
    className, 
    style, 
    format, 
    showTime, 
    bordered, 
    maxLength,
    defaultTimeStart,
    defaultTimeEnd
  } = props;
  
  const handleChange = (index: number, newValue: string) => {
    if (onChange) {
      const newValues = [...(value as [string, string] || ['', ''])];
      newValues[index] = newValue;
      onChange(newValues as [string, string]);
    }
  };
  
  const clearValues = () => {
    if (onChange) {
      onChange(['', ''] as [string, string]);
    }
  };
  
  const getValue = (index: number): string => {
    if (!value || value.length <= index) return '';
    const val = value[index];
    return typeof val === 'string' ? val : (val instanceof Date ? val.toISOString() : '');
  };
  
  return (
    <div className={`tea-datepicker tea-datepicker--range ${bordered ? 'tea-datepicker--bordered' : ''} ${disabled ? 'tea-datepicker--disabled' : ''}`} style={style}>
      <input
        className="tea-datepicker__input"
        type="text"
        value={getValue(0)}
        onChange={(e) => handleChange(0, e.target.value)}
        placeholder={placeholder[0] || '开始日期'}
        disabled={disabled}
        maxLength={maxLength || 50}
      />
      <span className="tea-datepicker__separator">~</span>
      <input
        className="tea-datepicker__input"
        type="text"
        value={getValue(1)}
        onChange={(e) => handleChange(1, e.target.value)}
        placeholder={placeholder[1] || '结束日期'}
        disabled={disabled}
        maxLength={maxLength || 50}
      />
      <span className="tea-datepicker__icon">📅</span>
      {(getValue(0) || getValue(1)) && (
        <span 
          className="tea-datepicker__clear" 
          onClick={clearValues}
        >
          ✕
        </span>
      )}
    </div>
  );
};

// 加载中属性
interface LoadingProps extends BasicProps {
  loading?: boolean;
}

// 加载中组件
const Loading: React.FC<LoadingProps> = (props) => (
  <div className="tea-loading">
    {props.loading && (
      <div className="tea-loading__spinner">
        <div className="tea-loading__circle"></div>
      </div>
    )}
    {props.children}
  </div>
);

// 布局属性
interface LayoutProps extends BasicProps {}

// 布局头部属性
interface HeaderProps extends BasicProps {}

// 布局内容属性
interface ContentProps extends BasicProps {}

// 布局组件
class Layout extends React.Component<LayoutProps> {
  static Header = (props: HeaderProps) => (
    <div className="tea-layout__header">{props.children}</div>
  );
  
  static Body = (props: BasicProps) => (
    <div className="tea-layout__body">{props.children}</div>
  );
  
  static Content = (props: ContentProps) => (
    <div className="tea-layout__content">{props.children}</div>
  );
  
  render() {
    return <div className={`tea-layout ${this.props.className || ''}`}>{this.props.children}</div>;
  }
}

// 对齐组件属性
interface JustifyProps extends BasicProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

// 对齐组件
const Justify: React.FC<JustifyProps> = (props) => (
  <div className="tea-justify">
    <div className="tea-justify__left">{props.left}</div>
    <div className="tea-justify__right">{props.right}</div>
  </div>
);

// 新增Grid组件
interface GridProps extends BasicProps {}

interface GridRowProps extends BasicProps {
  gutter?: number;
}

interface GridColProps extends BasicProps {
  span?: number;
}

class Grid extends React.Component<GridProps> {
  static Row = (props: GridRowProps) => (
    <div className="tea-row" style={{
      marginLeft: props.gutter ? `-${props.gutter / 2}px` : 0,
      marginRight: props.gutter ? `-${props.gutter / 2}px` : 0,
      display: 'flex',
      flexWrap: 'wrap'
    }}>
      {props.children}
    </div>
  );
  
  static Col = (props: GridColProps) => (
    <div className={`tea-col tea-col-${props.span || 24}`} style={{
      flex: props.span ? `0 0 ${(props.span / 24) * 100}%` : '0 0 100%',
      maxWidth: props.span ? `${(props.span / 24) * 100}%` : '100%',
      padding: '0 8px',
      boxSizing: 'border-box',
      ...props.style
    }}>
      {props.children}
    </div>
  );
  
  render() {
    return <div className="tea-grid">{this.props.children}</div>;
  }
}

// 对话框属性
interface DialogProps extends BasicProps {
  title?: React.ReactNode;
  onClose?: () => void;
}

// 对话框组件
const Dialog: React.FC<DialogProps> = (props) => (
  <div className="tea-dialog">
    <div className="tea-dialog__header">
      <h3>{props.title}</h3>
      <button onClick={props.onClose}>Close</button>
    </div>
    <div className="tea-dialog__content">
      {props.children}
    </div>
  </div>
);

// 下拉菜单属性
interface DropdownProps extends BasicProps {
  options?: Array<{value: string, text: string}>;
  value?: string;
  onChange?: (value: string) => void;
}

// 下拉菜单组件
const Dropdown: React.FC<DropdownProps> = (props) => (
  <div className="tea-dropdown">
    <select 
      className="tea-dropdown__control" 
      value={props.value}
      onChange={(e) => props.onChange && props.onChange(e.target.value)}
    >
      {props.options?.map(option => (
        <option key={option.value} value={option.value}>{option.text}</option>
      ))}
    </select>
  </div>
);

// 通知属性
interface NotificationProps extends BasicProps {
  title?: React.ReactNode;
  message?: React.ReactNode;
  type?: 'success' | 'warning' | 'error';
}

// 通知组件
const Notification: React.FC<NotificationProps> = (props) => (
  <div className={`tea-notification tea-notification--${props.type || 'success'}`}>
    <h3>{props.title}</h3>
    <p>{props.message}</p>
  </div>
);

// 获取Row和Col组件以便独立导出
const Row = Grid.Row;
const Col = Grid.Col;

// Section组件属性
interface SectionProps extends BasicProps {
  title?: React.ReactNode;
}

// Section组件
const Section: React.FC<SectionProps> = (props) => (
  <div className="tea-section">
    {props.title && <div className="tea-section__header">{props.title}</div>}
    <div className="tea-section__body">{props.children}</div>
  </div>
);

// Spacer组件属性
interface SpacerProps extends BasicProps {
  size?: 's' | 'm' | 'l';
}

// Spacer组件
const Spacer: React.FC<SpacerProps> = (props) => (
  <div className={`tea-spacer tea-spacer--${props.size || 'm'}`}>
    {props.children}
  </div>
);

// 导出所有组件
const exports = {
  Table,
  Card,
  Form,
  Radio,
  Checkbox,
  Select,
  Input,
  Button,
  Icon,
  Text,
  Tabs,
  DatePicker,
  Loading,
  Layout,
  Justify,
  Grid,
  Dialog,
  Dropdown,
  Notification,
  Row,
  Col,
  Section,
  Spacer
};

console.log('TeaComponent loaded with Grid, Row, Col:', !!Grid, !!Row, !!Col);

export default exports; 