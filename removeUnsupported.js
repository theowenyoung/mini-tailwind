const remRE = /\d?\.?\d+\s*rem/g;
const pxRE = /\d?\.?\d+\s*px/g;
let globalProperties = {
  "align-content": true,
  "align-items": true,
  "align-self": true,
  background: true,
  "background-color": true,
  "background-image": true,
  "background-position": true,
  "background-repeat": ["repeat", "repeat-x", "repeat-y", "no-repeat"],
  "background-size": true,
  "border-bottom-color": true,
  "border-bottom-left-radius": true,
  "border-bottom-right-radius": true,
  "border-bottom-width": true,
  "border-color": true,
  "border-left-color": true,
  "border-left-width": true,
  "border-radius": true,
  "border-right-color": true,
  "border-right-width": true,
  "border-style": true,
  "border-top-color": true,
  "border-top-left-radius": true,
  "border-top-right-radius": true,
  "border-top-width": true,
  "border-width": true,
  "box-shadow": true,
  "clip-path": true,
  color: true,
  display: true,
  flex: true,
  "flex-direction": true,
  "flex-grow": true,
  "flex-shrink": true,
  "flex-wrap": true,
  font: true,
  "font-family": true,
  "font-size": true,
  "font-style": ["italic", "normal"],
  "font-weight": true,
  gap: true,
  "grid-auto-flow": true,
  "grid-column": true,
  "grid-column-end": true,
  "grid-column-start": true,
  "grid-row": true,
  "grid-row-end": true,
  "grid-row-start": true,
  "grid-template-columns": true,
  "grid-template-rows": true,
  height: true,
  "horizontal-align": ["left", "center", "right", "stretch"],
  "justify-content": true,
  "letter-spacing": true,
  "line-height": true,
  margin: true,
  "margin-bottom": true,
  "margin-left": true,
  "margin-right": true,
  "margin-top": true,
  "max-height": true,
  "max-width": true,
  "min-height": true,
  "min-width": true,
  "object-fit": true,
  "object-position": true,
  opacity: true,
  overflow: true,
  "overflow-wrap": true,
  padding: true,
  "padding-bottom": true,
  "padding-left": true,
  "padding-right": true,
  "padding-top": true,
  "placeholder-color": true,
  position: ["absolute", ""],
  scale: true,
  "text-align": ["left", "center", "right"],
  "text-decoration": ["none", "line-through", "underline"],
  "text-transform": ["none", "capitalize", "uppercase", "lowercase"],
  "transform-origin": true,
  transition: true,
  "transition-duration": true,
  "transition-property": true,
  "transition-timing-function": true,
  translate: true,
  "vertical-align": ["top", "center", "bottom", "stretch"],
  visibility: ["visible", "collapse"],
  "white-space": true,
  width: true,
  "word-break": true,
  "z-index": true,
  "text-overflow": true,
  "-webkit-line-clamp": true,
  "-webkit-box-orient": true,
  top: true,
  left: true,
  right: true,
  bottom: true,
  inset: true,
};
function isSupportedProperty(prop, val = null) {
  const rules = globalProperties[prop];
  if (!rules) return false;

  if (val) {
    if (Array.isArray(rules)) {
      return rules.includes(val);
    }
  }

  return true;
}

function isSupportedRule(selector) {
  if (
    selector.includes(":hover") ||
    selector.includes(":focus") ||
    selector.includes(":not") ||
    selector.includes(":before") ||
    selector.includes(":after")
  ) {
    return false;
  }

  return true;
}

module.exports = (options = {}) => {
  const unit = options.unit || "px";
  if (options.properties) {
    globalProperties = options.properties;
  }
  const designWidth = options.designWidth || 750;
  let globalRules = [];
  return {
    postcssPlugin: "postcss-taro-tailwind",
    OnceExit() {
      console.log(
        "由于小程序不支持组件级别的page selector, 以下默认全局样式未写入，如需要，可在page的样式文件里手动写入\n"
      );
      console.log(globalRules.join("\n"));
    },
    AtRule: {
      media: (atRule) => {
        // The fastest

        atRule.remove();
      },
      keyframes: (atRule) => {
        atRule.remove();
      },
    },
    Rule(rule) {
      if (!isSupportedRule(rule.selector)) {
        rule.remove();
      }

      // replace space and divide selectors to use a simpler selector that works in ns
      if (rule.selector.includes(":not(template) ~ :not(template)")) {
        rule.selectors = rule.selectors.map((selector) => {
          return selector.replace(":not(template) ~ :not(template)", "* + *");
        });
      }

      if (rule.selector === "*") {
        rule.selector = "page";
        globalRules.push(rule.toString());
        rule.remove();
      }

      // replace / selector to _

      if (rule.selector.includes("\\/")) {
        rule.selector = rule.selector.replace("\\/", "_");
      }

      // replace . selector to __
      if (rule.selector.includes("\\.")) {
        rule.selector = rule.selector.replace("\\.", "__");
      }
    },
    Declaration(decl) {
      // All declaration nodes
      if (decl.prop === "visibility") {
        switch (decl.value) {
          case "hidden":
            decl.replaceWith(decl.clone({ value: "collapse" }));
            return;
        }
      }

      if (decl.prop === "vertical-align") {
        switch (decl.value) {
          case "middle":
            decl.replaceWith(decl.clone({ value: "center" }));
            return;
        }
      }

      // allow using rem values (default unit in tailwind)
      if (decl.value.includes("rem")) {
        decl.value = decl.value.replace(remRE, (match, offset, value) => {
          const converted = "" + parseFloat(match) * 16 + "px";
          options.debug &&
            console.log("replacing rem value", {
              match,
              offset,
              value,
              converted,
            });

          return converted;
        });
        options.debug &&
          console.log({
            final: decl.value,
          });
      }

      // // allow using rem values (default unit in tailwind)
      if (decl.value.includes("px")) {
        const ratio = designWidth / 375;
        decl.value = decl.value.replace(pxRE, (match, offset, value) => {
          const converted = "" + parseFloat(match) * ratio + unit;
          return converted;
        });
      }

      if (
        !decl.prop.startsWith("--") &&
        !isSupportedProperty(decl.prop, decl.value)
      ) {
        // options.debug && console.log('removing ', decl.prop, decl.value)
        decl.remove();
      }
    },
    RuleExit(rule) {
      if (rule.nodes.length === 0) {
        rule.remove();
      }
    },
  };
};

module.exports.postcss = true;
