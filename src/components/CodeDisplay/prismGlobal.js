// Prism's language components are plain scripts that read a global `Prism`.
// Rolldown wraps prismjs core as a lazy CommonJS module, so without this the
// components run before core and throw "Prism is not defined" in production.
// Import this module before any prismjs/components/* import.
import Prism from 'prismjs'

globalThis.Prism = Prism

export default Prism
