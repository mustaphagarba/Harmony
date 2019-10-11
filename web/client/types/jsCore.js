// @flow
/**
 * Types that are core to JS itself.
 */

export type Comparator<A, B> = (A, B) => number;

export type PropertyDescriptor<T> = {
  value?: T,
  writable?: boolean,
  enumerable?: boolean,
  configurable?: boolean,
  get?: () => T,
  set?: T => void,
};

/**
 * This is a special descriptor that is passed to a decorator function,
 * only when the decorator is applied to a class field.
 */
export type FieldDecoratorDescriptor<T> = PropertyDescriptor<T> & {
  initializer?: () => T,
};

// Explanation of data & accessor descriptors:
// https://developer.mozilla.org/en-US/docs/Web/
//   JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor
export type DescriptorType = 'data' | 'accessor';

export type StyleObject = $Shape<
  $ObjMap<
    {
      WebkitOverflowScrolling: string,
      WebkitTransform: string,
      WebkitTransformOrigin: string,
      WebkitTransitionDelay: string | number,
      WebkitTransitionDuration: string | number,
      WebkitTransitionProperty: string,
      WebkitTransitionTimingFunction: string,
      MozTransform: string,
      MozTransformOrigin: string,
      MozTransitionDelay: string | number,
      MozTransitionDuration: string | number,
      MozTransitionProperty: string,
      MozTransitionTimingFunction: string,
      alignContent: string,
      alignItems: string,
      alignSelf: string,
      all: string,
      animation: string,
      animationDelay: string | number,
      animationDirection: string,
      animationDuration: string | number,
      animationFillMode: string,
      animationIterationCount: string | number,
      animationName: string,
      animationPlayState: string,
      animationTimingFunction: string,
      backdropFilter: string,
      webkitBackdropFilter: string,
      backfaceVisibility: string,
      background: string,
      backgroundAttachment: string,
      backgroundBlendMode: string,
      backgroundClip: string,
      backgroundColor: string,
      backgroundImage: string,
      backgroundOrigin: string,
      backgroundPosition: string,
      backgroundPositionX: string | number,
      backgroundPositionY: string | number,
      backgroundRepeat: string,
      backgroundSize: string,
      blockSize: string,
      border: string,
      borderBlockEnd: string,
      borderBlockEndColor: string,
      borderBlockEndStyle: string,
      borderBlockEndWidth: string | number,
      borderBlockStart: string,
      borderBlockStartColor: string,
      borderBlockStartStyle: string,
      borderBlockStartWidth: string | number,
      borderBottom: string,
      borderBottomColor: string,
      borderBottomLeftRadius: string | number,
      borderBottomRightRadius: string | number,
      borderBottomStyle: string,
      borderBottomWidth: string | number,
      borderCollapse: string,
      borderColor: string,
      borderImage: string,
      borderImageOutset: string,
      borderImageRepeat: string,
      borderImageSlice: string,
      borderImageSource: string,
      borderImageWidth: string | number,
      borderInlineEnd: string,
      borderInlineEndColor: string,
      borderInlineEndStyle: string,
      borderInlineEndWidth: string | number,
      borderInlineStart: string,
      borderInlineStartColor: string,
      borderInlineStartStyle: string,
      borderInlineStartWidth: string | number,
      borderLeft: string,
      borderLeftColor: string,
      borderLeftStyle: string,
      borderLeftWidth: string | number,
      borderRadius: string | number,
      borderRight: string,
      borderRightColor: string,
      borderRightStyle: string,
      borderRightWidth: string | number,
      borderSpacing: string | number,
      borderStyle: string,
      borderTop: string,
      borderTopColor: string,
      borderTopLeftRadius: string | number,
      borderTopRightRadius: string | number,
      borderTopStyle: string,
      borderTopWidth: string | number,
      borderWidth: string | number,
      bottom: string | number,
      boxDecorationBreak: string,
      boxShadow: string,
      boxSizing: string,
      breakAfter: string,
      breakBefore: string,
      breakInside: string,
      captionSide: string,
      caretColor: string,
      clear: string,
      clip: string,
      clipPath: string,
      color: string,
      columns: string,
      columnCount: string | number,
      columnFill: string,
      columnGap: string | number,
      columnRule: string,
      columnRuleColor: string,
      columnRuleStyle: string,
      columnRuleWidth: string | number,
      columnSpan: string,
      columnWidth: string | number,
      contain: string,
      content: string,
      counterIncrement: string,
      counterReset: string,
      cursor: string,
      direction: string,
      display: string,
      emptyCells: string,
      fill: string,
      filter: string,
      flex: string | number,
      flexBasis: string | number,
      flexDirection: string,
      flexFlow: string,
      flexGrow: string | number,
      flexShrink: string | number,
      flexWrap: string,
      float: string,
      font: string,
      fontFamily: string,
      fontFeatureSettings: string,
      fontKerning: string,
      fontLanguageOverride: string,
      fontSize: string | number,
      fontSizeAdjust: string | number,
      fontStretch: string,
      fontStyle: string,
      fontSynthesis: string,
      fontVariant: string,
      fontVariantAlternates: string,
      fontVariantCaps: string,
      fontVariantEastAsian: string,
      fontVariantLigatures: string,
      fontVariantNumeric: string,
      fontVariantPosition: string,
      fontWeight: string | number,
      grad: string,
      grid: string,
      gridArea: string,
      gridAutoColumns: string | number,
      gridAutoFlow: string,
      gridAutoPosition: string,
      gridAutoRows: string | number,
      gridColumn: string,
      gridColumnGap: string | number,
      gridColumnStart: string | number,
      gridColumnEnd: string | number,
      gridRow: string,
      gridRowStart: string | number,
      gridRowEnd: string | number,
      gridTemplate: string,
      gridTemplateAreas: string,
      gridTemplateRows: string | number,
      gridTemplateColumns: string | number,
      hangingPunctuation: string,
      height: string | number,
      hyphens: string,
      imageRendering: string,
      imageResolution: string,
      imageOrientation: string,
      inlineSize: string | number,
      isolation: string,
      justifyContent: string,
      left: string | number,
      letterSpacing: string | number,
      lineBreak: string,
      lineHeight: string | number,
      listStyle: string,
      listStyleImage: string,
      listStylePosition: string,
      listStyleType: string,
      margin: string | number,
      marginBlockEnd: string | number,
      marginBlockStart: string | number,
      marginBottom: string | number,
      marginInlineEnd: string | number,
      marginInlineStart: string | number,
      marginLeft: string | number,
      marginRight: string | number,
      marginTop: string | number,
      mask: string,
      maskType: string,
      maxBlockSize: string | number,
      maxHeight: string | number,
      maxInlineSize: string | number,
      maxWidth: string | number,
      minBlockSize: string | number,
      minHeight: string | number,
      minInlineSize: string | number,
      minWidth: string | number,
      mixBlendMode: string,
      objectFit: string,
      objectPosition: string,
      offsetBlockEnd: string,
      offsetBlockStart: string,
      offsetInlineEnd: string,
      offsetInlineStart: string,
      opacity: string | number,
      order: string | number,
      orphans: string | number,
      outline: string,
      outlineColor: string,
      outlineOffset: string | number,
      outlineStyle: string,
      outlineWidth: string | number,
      overflow: string,
      overflowWrap: string,
      overflowX: string,
      overflowY: string,
      padding: string | number,
      paddingBlockEnd: string | number,
      paddingBlockStart: string | number,
      paddingBottom: string | number | number,
      paddingInlineEnd: string | number,
      paddingInlineStart: string | number,
      paddingLeft: string | number,
      paddingRight: string | number,
      paddingTop: string | number,
      pageBreakAfter: string,
      pageBreakBefore: string,
      pageBreakInside: string,
      perspective: string | number,
      perspectiveOrigin: string,
      pointerEvents: string,
      position: string,
      quotes: string,
      resize: string,
      right: string | number,
      rubyAlign: string,
      rubyMerge: string,
      rubyPosition: string,
      scrollBehavior: string,
      scrollSnapCoordinate: string,
      scrollSnapDestination: string,
      scrollSnapPointsX: string,
      scrollSnapPointsY: string,
      scrollSnapType: string,
      shapeImageThreshold: string,
      shapeMargin: string | number,
      shapeOutside: string,
      tableLayout: string,
      tabSize: string | number,
      textAlign: string,
      textAlignLast: string,
      textCombineUpright: string,
      textDecoration: string,
      textDecorationColor: string,
      textDecorationLine: string,
      textDecorationStyle: string,
      textIndent: string | number,
      textJustify: string,
      textOrientation: string,
      textOverflow: string,
      textRendering: string,
      textShadow: string,
      textTransform: string,
      textUnderlinePosition: string,
      top: string | number,
      touchAction: string,
      transform: string,
      transformOrigin: string,
      transformStyle: string,
      transition: string,
      transitionDelay: string | number,
      transitionDuration: string | number,
      transitionProperty: string,
      transitionTimingFunction: string,
      unicodeBidi: string,
      unicodeRange: string,
      userSelect: string,
      verticalAlign: string,
      visibility: string,
      whiteSpace: string,
      widows: string | number,
      width: string | number,
      willChange: string,
      wordBreak: string,
      wordSpacing: string | number,
      wordWrap: string,
      writingMode: string,
      zIndex: string | number,
    },
    <V>(V) => ?V,
  >,
>;
