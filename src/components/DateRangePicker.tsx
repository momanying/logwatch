import React, { useState } from 'react';
import moment from 'moment';
import teaComponent from '../mock-tea-component-fixed';
import '../styles/DateRangePicker.css';

const { DatePicker } = teaComponent || {};
const RangePicker = DatePicker?.RangePicker;

interface DateRangePickerProps {
  onChange?: (dates: [moment.Moment, moment.Moment] | null) => void;
  defaultValue?: [moment.Moment, moment.Moment];
  format?: string;
  separator?: string;
  showTime?: boolean | { format: string; minuteStep?: number };
  placeholder?: [string, string];
}

// 创建一个模拟的RangePicker组件（如果tea组件库中没有）
const MockRangePicker: React.FC<DateRangePickerProps> = ({
  onChange,
  defaultValue,
  format = 'YYYY-MM-DD HH:mm',
  separator = '-',
  placeholder = ['开始日期', '结束日期']
}) => {
  // 初始化日期状态
  const [dates, setDates] = useState<[string, string]>([
    defaultValue && defaultValue[0] ? defaultValue[0].format(format) : '',
    defaultValue && defaultValue[1] ? defaultValue[1].format(format) : ''
  ]);

  // 处理日期变化
  const handleDateChange = (index: number, value: string) => {
    const newDates = [...dates] as [string, string];
    newDates[index] = value;
    setDates(newDates);
    
    // 尝试转换为moment对象并调用onChange
    if (onChange && newDates[0] && newDates[1]) {
      try {
        const startDate = moment(newDates[0], format);
        const endDate = moment(newDates[1], format);
        if (startDate.isValid() && endDate.isValid()) {
          onChange([startDate, endDate]);
        }
      } catch (e) {
        console.error('日期格式无效', e);
      }
    }
  };

  // 焦点处理
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="mock-date-range-picker">
      <input
        type="text"
        className="date-input start-date"
        value={dates[0]}
        onChange={(e) => handleDateChange(0, e.target.value)}
        placeholder={placeholder[0]}
        onFocus={handleFocus}
      />
      <span className="date-separator">{separator}</span>
      <input
        type="text"
        className="date-input end-date"
        value={dates[1]}
        onChange={(e) => handleDateChange(1, e.target.value)}
        placeholder={placeholder[1]}
        onFocus={handleFocus}
      />
      <div className="date-picker-icon">
        <span className="calendar-icon">
          <svg viewBox="0 0 1024 1024" width="14" height="14">
            <path d="M896 128h-160v-32c0-17.7-14.3-32-32-32s-32 14.3-32 32v32h-256v-32c0-17.7-14.3-32-32-32s-32 14.3-32 32v32h-160c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h704c17.7 0 32-14.3 32-32v-736c0-17.7-14.3-32-32-32z m-32 736h-640v-544h640v544z m0-608h-640v-96h160v32c0 17.7 14.3 32 32 32s32-14.3 32-32v-32h256v32c0 17.7 14.3 32 32 32s32-14.3 32-32v-32h96v96z" fill="#999"></path>
            <path d="M384 512h-64v-64h64v64z m192 0h-64v-64h64v64z m192 0h-64v-64h64v64z m-384 192h-64v-64h64v64z m192 0h-64v-64h64v64z m192 0h-64v-64h64v64z" fill="#999"></path>
          </svg>
        </span>
      </div>
    </div>
  );
};

const DateRangePicker: React.FC<DateRangePickerProps> = (props) => {
  // 设置默认参数
  const mergedProps = {
    separator: '-',
    placeholder: ['开始日期', '结束日期'] as [string, string],
    ...props
  };
  
  if (RangePicker) {
    // 转换props以匹配tea组件的RangePicker接口
    const teaProps = {
      ...mergedProps,
      onChange: mergedProps.onChange ? (value: any) => {
        if (Array.isArray(value) && value.length === 2) {
          mergedProps.onChange?.([moment(value[0]), moment(value[1])]);
        } else {
          mergedProps.onChange?.(null);
        }
      } : undefined
    };
    return <RangePicker {...teaProps} />;
  }
  
  return <MockRangePicker {...mergedProps} />;
};

export default DateRangePicker; 