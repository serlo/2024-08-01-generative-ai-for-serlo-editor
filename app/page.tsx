'use client'

import {
  Button,
  Card,
  Flex,
  Heading,
  Select,
  Spinner,
  Theme,
} from '@radix-ui/themes'
import * as Form from '@radix-ui/react-form'
import '@radix-ui/themes/styles.css'
import { SerloEditor, SerloEditorProps, SerloRenderer } from '@serlo/editor'
import React from 'react'
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

const initialState = {
  plugin: 'rows',
  state: [{ plugin: 'text' }],
}

enum Model {
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_4 = 'gpt-4',
  GPT_4O = 'gpt-4o',
  GPT_4_TURBO = 'gpt-4-turbo',
  GPT_4O_MINI = 'gpt-4o-mini',
}

export default function Home() {
  return (
    <Theme>
      <QueryClientProvider client={queryClient}>
        <main className="p-5">
          <App />
        </main>
      </QueryClientProvider>
    </Theme>
  )
}

function App() {
  const password = '123456'
  const [inputContent, setInputContent] = React.useState<Content>(initialState)
  const [outputContent, setOutputContent] =
    React.useState<Content>(initialState)
  const [prompt, setPrompt] = React.useState('Vereinfache den Text')
  const [model, setModel] = React.useState(Model.GPT_4O)
  const [backendResponse, setBackendResponse] = React.useState<unknown>(null)

  const fetchContent = useMutation({
    mutationFn: async ({
      content,
      prompt,
    }: {
      content: string
      prompt: string
    }) => {
      const response = await fetch(
        createUrl({
          path: '/api/generate-content',
          query: { content, prompt, password, model },
        }),
        { method: 'POST' },
      )

      if (!response.ok) {
        console.error('Failed fetch', await response.text())
        throw new Error('Failed fetch')
      }

      const backendResponse = await response.json()

      setBackendResponse(backendResponse)
      setOutputContent(JSON.parse(backendResponse.content))
    },
  })

  return (
    <>
      <Flex gap="3" wrap="wrap">
        <FlexItem>
          <Heading>Input for the generative AI</Heading>
          <SerloEditor
            initialState={inputContent}
            onChange={({ changed, getDocument }) => {
              if (changed) {
                const newState = getDocument()

                if (newState != null) {
                  setInputContent(newState)
                }
              }
            }}
          >
            {(editor) => {
              return <>{editor.element}</>
            }}
          </SerloEditor>
        </FlexItem>
        <FlexItem>
          <Heading>Settings for the generative AI</Heading>
          <Form.Root>
            <Form.Field name="prompt">
              <Form.Label>User Prompt:</Form.Label>
              <Form.Control asChild>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={8}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                />
              </Form.Control>
            </Form.Field>
            <Form.Field name="model" className="mt-2">
              <Form.Label>Model:</Form.Label>
              <Form.Control asChild>
                <Select.Root defaultValue={model}>
                  <Select.Trigger />
                  <Select.Content>
                    {Object.values(Model).map((model) => (
                      <Select.Item
                        value={model}
                        onClick={() => setModel(model)}
                        key={model}
                      >
                        {model}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Form.Control>
            </Form.Field>
          </Form.Root>
          <Button
            onClick={() =>
              fetchContent.mutate({
                content: JSON.stringify(inputContent, null, 2),
                prompt,
              })
            }
            disabled={fetchContent.isPending}
            className="mt-2"
          >
            Generate Content with AI
          </Button>
        </FlexItem>
        <FlexItem>
          <Heading>Output of the generative AI</Heading>
          {fetchContent.isPending ? <Spinner /> : null}
          <SerloRenderer document={outputContent} />
        </FlexItem>
        <FlexItem>
          <Heading>Response from Backend</Heading>
          <pre>{JSON.stringify(backendResponse, null, 2)}</pre>
        </FlexItem>
      </Flex>
    </>
  )
}

function FlexItem({ children }: { children: React.ReactNode }) {
  return <Card className="min-w-[600px] w-1/3">{children}</Card>
}

type Content = SerloEditorProps['initialState']

function createUrl({
  path,
  query,
}: {
  path: string
  query: Record<string, string>
}) {
  const url = new URL(path, window.location.href)

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value)
  }

  return url.toString()
}
