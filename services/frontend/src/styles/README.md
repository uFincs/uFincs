# Styles

Ah, styles. Along with the atomic design component hierarchy, these styles make up the other half of uFincs' custom design system. From colors to fonts to sizes, everything here has been lovingly hand-crafted to deliver one of the best personal finance experiences around™.

The core of the design system is a number of different 'scales'. Each color has a scale, fonts have a couple, and there's an even a generic 'sizes' scale for everything else. This greatly standardizes the overall design as well as making dev life a heck of a lot easier — just pick a value from the scale and adjust up or down until it looks right. Of course, it also makes it very easy to change things across the app; haven't had to yet, but it's possible!

If you're wondering what the TypeScript definition files are for, it's because we take advantage of being able to export Sass variables for use in TypeScript land. Gotta maximize that reusuability.

Also, the files are named `*.module.scss` because there was a bug in one of the `create-react-scripts` versions that broke variable exports without the `.module` part. So... we don't actually make use of CSS modules. And I've yet to bother to check to see if that bug has been fixed...
