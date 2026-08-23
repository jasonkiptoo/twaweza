import React from 'react';
import { createIcon } from '@gluestack-ui/core/icon/creator';
import { tva, type VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';
import { PrimitiveIcon, IPrimitiveIcon, Svg } from '@gluestack-ui/core/icon/creator';

export const UIIcon = createIcon({
  Root: PrimitiveIcon,
}) as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof PrimitiveIcon> & React.RefAttributes<React.ComponentRef<typeof Svg>>
>;

const iconStyle = tva({
  base: 'text-foreground fill-none pointer-events-none',
  variants: {
    size: {
      '2xs': 'h-3 w-3',
      'xs': 'h-3.5 w-3.5',
      'sm': 'h-4 w-4',
      'md': 'h-[18px] w-[18px]',
      'lg': 'h-5 w-5',
      'xl': 'h-6 w-6',
    },
  },
});

cssInterop(UIIcon, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: true,
      width: true,
      fill: true,
      color: 'classNameColor',
      stroke: true,
    },
  },
});

type IIconProps = IPrimitiveIcon &
  VariantProps<typeof iconStyle> &
  React.ComponentPropsWithoutRef<typeof UIIcon>;

const Icon = React.forwardRef<React.ComponentRef<typeof UIIcon>, IIconProps>(
  function Icon({ size = 'md', className, ...props }, ref) {
    if (typeof size === 'number') {
      return <UIIcon ref={ref} {...props} className={iconStyle({ class: className })} size={size} />;
    }
    return (
      <UIIcon
        ref={ref}
        {...props}
        className={iconStyle({ size, class: className })}
      />
    );
  }
);

Icon.displayName = 'Icon';

export { Icon };
