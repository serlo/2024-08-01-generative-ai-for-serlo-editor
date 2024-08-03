export const jsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Educational content for the Serlo Editor',
  type: 'object',
  properties: {
    plugin: {
      const: 'rows',
    },
    state: {
      type: 'array',
      items: {
        anyOf: [{ $ref: '#/$defs/text' }],
      },
    },
    required: ['plugin', 'state'],
  },
  $defs: {
    text: {
      type: 'object',
      properties: {
        plugin: {
          const: 'text',
        },
        state: {
          type: 'array',
          items: {
            type: '#/$defs/Paragraph',
          },
        },
      },
      required: ['plugin'],
    },
    CustomText: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        strong: { type: 'boolean' },
        em: { type: 'boolean' },
        code: { type: 'boolean' },
        color: { type: 'integer' },
        showPlaceholder: { type: 'boolean' },
      },
      required: ['text'],
    },
    MathElement: {
      type: 'object',
      properties: {
        type: { const: 'math' },
        src: { type: 'string' },
        inline: { type: 'boolean' },
        children: {
          type: 'array',
          items: { $ref: '#/definitions/CustomText' },
        },
      },
      required: ['type', 'src', 'inline', 'children'],
    },
    Heading: {
      type: 'object',
      properties: {
        type: { const: 'h' },
        level: { enum: [1, 2, 3] },
        children: {
          type: 'array',
          items: { $ref: '#/definitions/CustomText' },
        },
      },
      required: ['type', 'level', 'children'],
    },
    Paragraph: {
      type: 'object',
      properties: {
        type: { const: 'p' },
        children: {
          type: 'array',
          items: {
            anyOf: [
              { $ref: '#/definitions/CustomText' },
              { $ref: '#/definitions/MathElement' },
            ],
          },
        },
      },
      required: ['type', 'children'],
    },
    Link: {
      type: 'object',
      properties: {
        type: { const: 'a' },
        href: { type: 'string' },
        children: {
          type: 'array',
          items: { $ref: '#/definitions/CustomText' },
        },
      },
      required: ['type', 'href', 'children'],
    },
    ListElementType: {
      type: 'string',
      enum: ['unordered-list', 'ordered-list', 'list-item', 'list-item-child'],
    },
    ListItemText: {
      type: 'object',
      properties: {
        type: { const: 'list-item-child' },
        children: {
          type: 'array',
          items: { $ref: '#/definitions/CustomText' },
        },
      },
      required: ['type', 'children'],
    },
    ListItem: {
      type: 'object',
      properties: {
        type: { const: 'list-item' },
        children: {
          type: 'array',
          items: {
            oneOf: [
              { type: 'array', items: { $ref: '#/definitions/ListItemText' } },
              {
                type: 'array',
                items: [
                  { $ref: '#/definitions/ListItemText' },
                  { $ref: '#/definitions/List' },
                ],
                minItems: 2,
                maxItems: 2,
              },
            ],
          },
        },
      },
      required: ['type', 'children'],
    },
    List: {
      type: 'object',
      properties: {
        type: {
          enum: ['unordered-list', 'ordered-list'],
        },
        children: {
          type: 'array',
          items: { $ref: '#/definitions/ListItem' },
        },
      },
      required: ['type', 'children'],
    },
  },
}
