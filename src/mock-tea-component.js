/**
 * 这是一个腾讯tea-component库的模拟文件
 * 用于在没有内部组件库时提供基本结构
 */

import React from 'react';

// 创建基本组件
const createComponent = (name) => {
  const Component = (props) => {
    return <div data-component={name} {...props}>{props.children}</div>;
  };
  return Component;
};

// 创建带静态方法/属性的组件
const createCompoundComponent = (name, staticProps = []) => {
  const Component = createComponent(name);
  
  staticProps.forEach(prop => {
    Component[prop] = createComponent(`${name}.${prop}`);
  });
  
  return Component;
};

// 模拟主要组件
export const Layout = createCompoundComponent('Layout', ['Header', 'Body', 'Content']);
export const Card = createCompoundComponent('Card', ['Body']);
export const Modal = createCompoundComponent('Modal', ['Body', 'Footer']);
export const Form = createCompoundComponent('Form', ['Item']);
export const Radio = createCompoundComponent('Radio', ['Group']);
export const Dialog = createCompoundComponent('Dialog', ['Body', 'Footer']);
export const Dropdown = createCompoundComponent('Dropdown', ['MenuItem']);
export const Table = createCompoundComponent('Table', ['Head', 'Body', 'Row', 'Cell', 'Column']);
export const Tabs = createCompoundComponent('Tabs', ['TabPanel']);

export const Button = createComponent('Button');
export const Input = createComponent('Input');
export const Icon = createComponent('Icon');
export const Text = createComponent('Text');
export const Status = createComponent('Status');
export const Justify = createComponent('Justify');
export const Loading = createComponent('Loading');
export const Alert = createComponent('Alert');
export const Row = createComponent('Row');
export const Col = createComponent('Col');
export const Select = createComponent('Select');
export const NavMenu = createComponent('NavMenu');
export const Tag = createComponent('Tag');
export const Checkbox = createComponent('Checkbox');
export const Pagination = createComponent('Pagination');

// DatePicker组件及其RangePicker子组件
export const DatePicker = createComponent('DatePicker');
DatePicker.RangePicker = createComponent('DatePicker.RangePicker');

// 模拟提示组件
export const Bubble = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
};

export const notification = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
};

// 也提供Notification作为别名
export const Notification = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
}; 