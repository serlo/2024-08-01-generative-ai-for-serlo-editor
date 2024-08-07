/**
 * A content type that can be used to store rich text content.
 */
interface TextPlugin {
  plugin: 'text'
  state: SlateBlock[]
}

type SlateBlock = Paragraph | Heading | UnorderedList | OrderedList
type SlateInline = CustomText | MathElement | Link

/**
 * A heading similar to an h1, h2, h3, etc.
 */
interface Heading {
  type: 'h'
  /**
   * The level of the heading. 1 is the highest level.
   * Use 1 for h1, 2 for h2, etc.
   */
  level: 1 | 2 | 3
  /**
   * The content of the heading.
   */
  children: SlateInline[]
}

/**
 * A paragraph of text similar to a <p> tag in HTML.
 */
interface Paragraph {
  type: 'p'
  /**
   * The content of the paragraph.
   */
  children: SlateInline[]
}

/**
 * A link similar to an <a> tag in HTML.
 */
interface Link {
  type: 'a'
  /**
   * The URL that the link points
   */
  href: string
  children: (CustomText | MathElement)[]
}

/**
 * An unordered list similar to an <ul> tag in HTML.
 */
interface UnorderedList {
  type: 'unordered-list'
  children: ListItem[]
}

/**
 * An ordered list similar to an <ol> tag in HTML.
 */
interface OrderedList {
  type: 'ordered-list'
  children: ListItem[]
}

/**
 * A list item similar to an <li> tag in HTML.
 */
interface ListItem {
  type: 'list-item'
  children:
    | [ListItemText]
    | [ListItemText, UnorderedList]
    | [ListItemText, OrderedList]
}

/**
 * A list item child which only contains text elements (similar to the body of an <li> tag in HTML).
 */
interface ListItemText {
  type: 'list-item-child'
  children: CustomText[]
}

/**
 * A math element similar to a <math> tag in HTML.
 */
interface MathElement {
  type: 'math'
  /**
   * The LaTeX source code of the math element.
   */
  src: string
  /**
   * Set to true if the math element should be displayed inline like $...$ in LaTeX.
   * Set to false if the math element should be displayed as a block like $$...$$ in LaTeX.
   */
  inline: boolean
  children: CustomText[]
}

/**
 * A custom text element that can be styled with different text styles.
 */
interface CustomText {
  text: string
  /**
   * Set to true if the text should be displayed in bold like <b> or <strong> in HTML.
   */
  strong?: true
  /**
   * Set to true if the text should be displayed in italic like <i> or <em> in HTML.
   */
  em?: true
  /**
   * Set to true if the text should be displayed in code like <code> in HTML.
   */
  code?: true
}
