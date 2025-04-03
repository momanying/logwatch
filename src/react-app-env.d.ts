/// <reference types="react-scripts" />

// 声明腾讯内部组件库
declare module '@tencent/tea-component' {
  import { ReactNode, ReactElement, FormEvent, CSSProperties } from 'react';
  
  export interface ModalProps {
    visible?: boolean;
    caption?: string;
    onClose?: () => void;
    disableEscape?: boolean;
    children?: ReactNode;
  }

  export class Modal extends React.Component<ModalProps> {
    static Body: React.FC<{ children?: ReactNode }>;
    static Footer: React.FC<{ children?: ReactNode }>;
  }

  export interface FormProps {
    children?: ReactNode;
    onSubmit?: (e: FormEvent<Element>) => void;
  }

  export class Form extends React.Component<FormProps> {
    static Item: React.FC<{ label?: string; required?: boolean; children?: ReactNode }>;
  }

  export interface InputProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    size?: string;
    type?: string;
  }

  export class Input extends React.Component<InputProps> {}

  export interface RadioProps {
    name?: string;
    children?: ReactNode;
  }

  export class Radio extends React.Component<RadioProps> {
    static Group: React.FC<{ 
      value?: string; 
      onChange?: (value: string) => void; 
      className?: string;
      children?: ReactNode;
    }>;
  }

  export interface ButtonProps {
    type?: 'primary' | 'weak' | 'link';
    onClick?: () => void;
    children?: ReactNode;
  }

  export class Button extends React.Component<ButtonProps> {}

  export interface IconProps {
    type?: string;
    size?: string;
  }

  export class Icon extends React.Component<IconProps> {}

  export interface AlertProps {
    type?: 'success' | 'info' | 'warning' | 'error';
    message?: string;
  }

  export class Alert extends React.Component<AlertProps> {}

  export interface CardProps {
    children?: ReactNode;
  }

  export class Card extends React.Component<CardProps> {
    static Body: React.FC<{ 
      children?: ReactNode; 
      title?: string; 
      subtitle?: string;
      style?: CSSProperties;
    }>;
  }

  export interface TableProps {
    columns?: Array<{
      key: string;
      header?: string;
      width?: number;
      render?: (item: any, index?: number) => ReactNode;
    }>;
    records?: any[];
    recordKey?: string | ((record: any, index: number) => string);
    bordered?: boolean;
    rowClick?: (index: number, record: any) => void;
    topTip?: ReactNode;
  }

  export class Table extends React.Component<TableProps> {}

  export interface StatusProps {
    icon?: string;
    title?: string;
    description?: string;
  }

  export class Status extends React.Component<StatusProps> {}

  export interface TextProps {
    theme?: 'primary' | 'default' | 'weak';
    overflow?: boolean;
    style?: CSSProperties;
    children?: ReactNode;
  }

  export class Text extends React.Component<TextProps> {}

  export interface JustifyProps {
    left?: ReactNode;
    right?: ReactNode;
  }

  export class Justify extends React.Component<JustifyProps> {}

  export interface LayoutProps {
    className?: string;
    children?: ReactNode;
  }

  export class Layout extends React.Component<LayoutProps> {
    static Header: React.FC<{ children?: ReactNode }>;
    static Body: React.FC<{ className?: string; children?: ReactNode }>;
    static Content: React.FC<{ children?: ReactNode }>;
  }

  export class Loading extends React.Component<{ loading?: boolean }> {}

  export const Bubble: {
    success: (options: { content: string }) => void;
    error: (options: { content: string }) => void;
    info: (options: { content: string }) => void;
    warning: (options: { content: string }) => void;
  };

  export const notification: {
    success: (options: { title: string; description?: string; timeout?: number }) => void;
    error: (options: { title: string; description?: string; timeout?: number }) => void;
    info: (options: { title: string; description?: string; timeout?: number }) => void;
    warning: (options: { title: string; description?: string; timeout?: number }) => void;
  };

  export interface TabsProps {
    tabs: Array<{ id: string; label: string }>;
    activeId?: string;
    onActive?: (key: string) => void;
  }

  export class Tabs extends React.Component<TabsProps> {}
} 