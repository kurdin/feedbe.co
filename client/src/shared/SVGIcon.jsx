import { Component, createElement } from 'react';
import cx from 'classnames';

const cleanups = {
  // some useless stuff for us
  // that svgo doesn't remove
  title: /<title>.*<\/title>/gi,
  desc: /<desc>.*<\/desc>/gi,
  comment: /<!--.*-->/gi,
  defs: /<defs>.*<\/defs>/gi,

  // remove hardcoded dimensions
  width: / +width="\d+(\.\d+)?(px)?"/gi,
  height: / +height="\d+(\.\d+)?(px)?"/gi,

  // remove fill
  fill: / +fill="(none|#[0-9a-f]+)"/gi,

  // Sketch.app shit
  sketchMSShapeGroup: / +sketch:type="MSShapeGroup"/gi,
  sketchMSPage: / +sketch:type="MSPage"/gi,
  sketchMSLayerGroup: / +sketch:type="MSLayerGroup"/gi
};

class SVGInline extends Component {
  render() {
    const {
      component,
      svg,
      fill,
      width,
      accessibilityLabel,
      accessibilityDesc,
      classSuffix,
      cleanupExceptions,
      ...componentProps
    } = this.props;

    const className = this.props.class || this.props.className;

    let { cleanup, height } = this.props;

    if (
      // simple way to enable entire cleanup
      cleanup === true ||
      // passing cleanupExceptions enable cleanup as well
      (cleanup.length === 0 && cleanupExceptions.length > 0)
    ) {
      cleanup = Object.keys(cleanups);
    }
    cleanup = cleanup.filter(key => {
      return !(cleanupExceptions.indexOf(key) > -1);
    });

    if (width && height === undefined) {
      height = width;
    }

    // remove useless props for wrapper
    delete componentProps.cleanup;
    delete componentProps.height;

    const classes = cx({
      SVGInline: true,
      'SVGInline--cleaned': cleanup.length,
      [className]: className,
      [className]: className
    });
    const svgClasses = classes.split(' ').join(classSuffix + ' ') + classSuffix;
    let svgStr = SVGInline.cleanupSvg(svg, cleanup).replace(
      /<svg/,
      `<svg class="${svgClasses}"` +
        (fill ? ` fill="${fill}"` : '') +
        (width || height
          ? ' style="' + (width ? `width: ${width};` : '') + (height ? `height: ${height};` : '') + '"'
          : '')
    );
    let match;
    if (accessibilityDesc) {
      match = /<svg.*?>/.exec(svgStr);
      const pos = match.index + match[0].length;
      svgStr = svgStr.substr(0, pos) + `<desc>${accessibilityDesc}</desc>` + svgStr.substr(pos);
    }
    if (accessibilityLabel) {
      match = match || /<svg.*?>/.exec(svgStr);
      const pos = match.index + match[0].length - 1;
      const id = `SVGInline-${SVGInline.idCount++}-title`;
      svgStr =
        svgStr.substr(0, pos) +
        ` role="img" aria-labelledby="${id}"` +
        svgStr.substr(pos, 1) +
        `<title id="${id}">${accessibilityLabel}</title>` +
        svgStr.substr(pos + 1);
    }
    return createElement(component, {
      ...componentProps, // take most props
      className: classes,
      dangerouslySetInnerHTML: {
        __html: svgStr
      }
    });
  }
}

SVGInline.defaultProps = {
  component: 'span',
  classSuffix: '-svg',
  cleanup: [],
  cleanupExceptions: []
};

SVGInline.idCount = 0;

SVGInline.cleanupSvg = (svg, cleanup = []) => {
  return Object.keys(cleanups)
    .filter(key => cleanup.indexOf(key) > -1)
    .reduce((acc, key) => {
      return acc.replace(cleanups[key], '');
    }, svg)
    .trim();
};

export default SVGInline;
