import React, { forwardRef, memo } from 'react';
import { H1, H2, H3, H4, H5, H6 } from '@expo/html-elements';
import { headingStyle } from './styles';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';

type IHeadingProps = VariantProps<typeof headingStyle> &
  React.ComponentPropsWithoutRef<typeof H1> & {
    as?: React.ElementType;
  };

cssInterop(H1, { className: 'style' });
cssInterop(H2, { className: 'style' });
cssInterop(H3, { className: 'style' });
cssInterop(H4, { className: 'style' });
cssInterop(H5, { className: 'style' });
cssInterop(H6, { className: 'style' });

const Heading = memo(
  forwardRef<React.ComponentRef<typeof H1>, IHeadingProps>(function Heading(
    {
      size = 'lg',
      className,
      isTruncated,
      bold,
      underline,
      strikeThrough,
      sub,
      italic,
      highlight,
      as: AsComp,
      ...props
    },
    ref
  ) {
    const commonProps = {
      className: headingStyle({
        size,
        isTruncated: isTruncated as boolean,
        bold: bold as boolean,
        underline: underline as boolean,
        strikeThrough: strikeThrough as boolean,
        sub: sub as boolean,
        italic: italic as boolean,
        highlight: highlight as boolean,
        class: className,
      }),
      ...props,
    };

    if (AsComp) {
      return <AsComp {...commonProps} ref={ref} />;
    }

    switch (size) {
      case '5xl':
      case '4xl':
      case '3xl':
        return <H1 {...commonProps} ref={ref as React.Ref<any>} />;
      case '2xl':
        return <H2 {...commonProps} ref={ref as React.Ref<any>} />;
      case 'xl':
        return <H3 {...commonProps} ref={ref as React.Ref<any>} />;
      case 'lg':
        return <H4 {...commonProps} ref={ref as React.Ref<any>} />;
      case 'md':
        return <H5 {...commonProps} ref={ref as React.Ref<any>} />;
      default:
        return <H6 {...commonProps} ref={ref as React.Ref<any>} />;
    }
  })
);

Heading.displayName = 'Heading';

export { Heading };
