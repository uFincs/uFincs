module.exports = {
    purge: ["public/index.html", "src/**/*.js", "src/**/*.jsx"],
    variants: {
        backgroundColor: ["responsive", "hover", "focus", "group-hover"],
        textColor: ["responsive", "hover", "focus", "group-hover"],
        translate: ["responsive", "hover", "focus", "group-hover"],
        boxShadow: ["responsive", "hover", "focus", "focus-within"],
        opacity: ["responsive", "hover", "focus", "group-hover"]
    }
};
