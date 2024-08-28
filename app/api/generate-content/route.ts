import * as jsonSchema from '../../serlo-editor/content-type.json'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { OpenAI } from 'openai'

export const maxDuration = 100
export const runtime = 'edge'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const systemPrompt = `You are tasked with generating educational content in JSON format based on a given JSON schema and input JSON. Your goal is to create content that adheres to the provided schema while incorporating information from the input JSON.

First, examine the following JSON schema:

<json_schema>
${JSON.stringify(jsonSchema, null, 2)}
</json_schema>

This schema defines the structure and constraints for the educational content you will generate. Pay close attention to the required fields, data types, and any specific formatting requirements outlined in the schema.

To generate the educational content:

1. Analyze the JSON schema to understand the required structure and constraints.
2. Review the input JSON to extract relevant information.
3. Create new educational content that follows the schema structure while incorporating details from the input JSON where appropriate.
4. Ensure that all required fields in the schema are included in your output.
5. Adhere to any specific data types or formatting requirements specified in the schema.
6. If the schema includes optional fields, use your discretion to include them based on the relevance of the input JSON or the potential educational value.
7. Generate content that is coherent, informative, and educational in nature.

Your output should be a valid JSON object that conforms to the provided schema.

If you encounter any conflicts between the schema requirements and the input JSON, prioritize adhering to the schema. If the input JSON is missing information required by the schema, use placeholder text or generate appropriate content to fill those fields.

If the schema or input JSON contains errors or is invalid, explain the issue and provide suggestions for correction if possible.

Remember to maintain a educational tone and focus throughout the generated content. Your goal is to create valuable learning material that fits the specified structure.`
const contentPrompt = `Now, consider the input JSON:

<input_json>
{{INPUT_JSON}}
</input_json>

This input JSON contains information that you should use to inform and populate the educational content you generate. Use the details of the following prompt to create content that aligns with the schema and incorporates relevant information from the input JSON.`

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (req.nextUrl.searchParams.get('password') !== process.env.PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  try {
    const content = req.nextUrl.searchParams.get('content')
    const userPrompt = req.nextUrl.searchParams.get('prompt')
    const model = req.nextUrl.searchParams.get('model') ?? 'gpt-4o'

    if (userPrompt == null) {
      return NextResponse.json(
        { error: 'Missing user prompt' },
        { status: 400 },
      )
    }

    const openAIResponse = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...(content == null
          ? []
          : [
              {
                role: 'user',
                content: contentPrompt.replace('{{INPUT_JSON}}', content),
              } as const,
            ]),
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.25,
      ...(model != 'gpt-4' ? { response_format: { type: 'json_object' } } : {}),
    })

    return NextResponse.json({
      openAIResponse,
      content: openAIResponse.choices[0]?.message?.content,
    })
  } catch (error) {
    console.error('Error fetching suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestion' },
      { status: 500 },
    )
  }
}
