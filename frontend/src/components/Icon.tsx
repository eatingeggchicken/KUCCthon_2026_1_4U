import React from 'react';

export type IconName =
  | 'house' | 'mail' | 'pencil' | 'user' | 'bell'
  | 'move-left' | 'rabbit' | 'circle-question-mark'
  | 'lock-keyhole' | 'mail-check' | 'mail-x' | 'mail-warning'
  | 'search' | 'search-x' | 'chevron-right' | 'chevron-left' | 'leaf';

interface Props {
  name: IconName;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

export default function Icon({ name, size = 22, style, className }: Props) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: 'currentColor',
        WebkitMask: `url(/icon/${name}.svg) no-repeat center / contain`,
        mask: `url(/icon/${name}.svg) no-repeat center / contain`,
        ...style,
      }}
    />
  );
}
