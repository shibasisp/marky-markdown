var marked      = require("marked")
var cheerio     = require("cheerio")
var sanitizer   = require("sanitizer")
var defaults    = require("lodash").defaults
var badges      = require("./lib/badges")
var github      = require("./lib/github")
var gravatar    = require("./lib/gravatar")
var packagize   = require("./lib/packagize")
var renderer    = require("./lib/renderer")

var marky = module.exports = function(markdown, options) {
  var html
  var $

  // Validate input
  if (!markdown || typeof markdown !== "string") {
    throw new Error("first argument must be a string")
  }

  if (options && typeof options !== "object") {
    throw new Error("options must but an object")
  }

  // Set default options
  options = options || {}
  defaults(options, {
    package: null,
    renderer: renderer,
  })

  // Parse markdown into HTML and add syntax highlighting
  html = marked.parse(markdown, {renderer: options.renderer})

  // Sanitize malicious or malformed HTML
  // html = sanitizer.sanitize(html)

  // Turn HTML into DOM object
  $ = cheerio.load(html)

  // Make gravatar img URLs secure
  $ = gravatar($)

  // Make relative GitHub link URLs absolute
  $ = github($, options.package)

  // Add CSS classes to paragraphs containing badges
  $ = badges($)

  // Inject package name and description into README
  $ = packagize($, options.package)

  // Call .html() on the return value to get an HTML string
  return $
}
