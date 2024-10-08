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
import LoginForm from './components/login-form'
import ErrorBoundary from './components/error-boundary'
import { PasswordContext } from './hooks/password-context'

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
        <LoginForm>
          <main className="p-5">
            <App />
          </main>
        </LoginForm>
      </QueryClientProvider>
    </Theme>
  )
}

function App() {
  const password = React.useContext(PasswordContext)
  const firstLoad = React.useRef(true)
  const [inputContent, setInputContent] = React.useState<Content>(initialState)
  const [outputContent, setOutputContent] = React.useState<Content | null>(null)
  const [prompt, setPrompt] = React.useState('Vereinfache den Text')
  const [model, setModel] = React.useState(Model.GPT_4O)
  const [openAIResponse, setOpenAIResponse] = React.useState<unknown>(null)
  const [costState, setCostState] = React.useState({
    cost: 0,
    costOfLastCall: 0,
    inputTokens: 0,
    outputTokens: 0,
    inputTokensOfLastCall: 0,
    outputTokensOfLastCall: 0,
  })

  React.useEffect(() => {
    interface StateType {
      inputContent: Content
      outputContent: Content | null
      prompt: string
      model: Model
    }

    if (firstLoad.current) {
      firstLoad.current = false
      const urlParams = new URLSearchParams(window.location.search)
      const encodedState = urlParams.get('state')
      if (encodedState) {
        try {
          const decodedState = decodeURIComponent(atob(encodedState))
          const parsedState: StateType = JSON.parse(decodedState)

          setInputContent(parsedState.inputContent)
          setOutputContent(parsedState.outputContent)
          setPrompt(parsedState.prompt)
          setModel(parsedState.model)
        } catch (error) {
          console.error('Failed to decode or parse state from URL:', error)
        }
      }
    } else {
      const state: StateType = {
        inputContent,
        outputContent,
        prompt,
        model,
      }
      const encodedState = btoa(encodeURIComponent(JSON.stringify(state)))
      const url = new URL(window.location.href)
      url.searchParams.set('state', encodedState)
      window.history.replaceState({}, '', url.toString())
    }
  }, [inputContent, model, outputContent, prompt])

  const fetchContent = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        createUrl({
          path: '/api/generate-content',
          query: {
            prompt,
            password,
            model,
            ...(toText(inputContent).trim().length > 0
              ? { content: JSON.stringify(inputContent) }
              : {}),
          },
        }),
        { method: 'POST' },
      )

      if (!response.ok) {
        console.error('Failed fetch', await response.text())
        throw new Error('Failed fetch')
      }

      const backendResponse = await response.json()

      const {
        prompt_tokens: inputTokensOfLastCall,
        completion_tokens: outputTokensOfLastCall,
      } = backendResponse.openAIResponse.usage

      const { input, output } = getPrice(model)

      const costOfLastCall =
        (input * inputTokensOfLastCall) / 1e6 +
        (output * outputTokensOfLastCall) / 1e6

      setCostState((prev) => {
        return {
          cost: prev.cost + costOfLastCall,
          costOfLastCall,
          inputTokens: costState.inputTokens + inputTokensOfLastCall,
          outputTokens: costState.outputTokens + outputTokensOfLastCall,
          inputTokensOfLastCall,
          outputTokensOfLastCall,
        }
      })

      setOpenAIResponse(backendResponse.openAIResponse)
      setOutputContent(JSON.parse(backendResponse.content))
    },
  })

  const { input, output } = getPrice(model)

  return (
    <>
      <Flex gap="3" wrap="wrap">
        <FlexItem>
          <Heading>Optional: Input for the generative AI</Heading>
          <p className="mt-2">
            Enter content for generative AI in the following editor component.
            Leave it empty when you do not want to send any additional content
            as an input:
          </p>
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
            onClick={() => fetchContent.mutate()}
            disabled={fetchContent.isPending}
            className="mt-2"
          >
            Generate Content with AI
          </Button>
        </FlexItem>
        <FlexItem>
          <Heading>Output of the generative AI</Heading>
          {fetchContent.isPending ? <Spinner /> : null}
          <ErrorBoundary>
            <SerloRenderer document={outputContent ?? initialState} />
          </ErrorBoundary>
        </FlexItem>
        <FlexItem>
          <Heading>Costs</Heading>
          {fetchContent.isPending ? <Spinner /> : null}
          <p>
            Price of current model: Input={input}$/1M tokens, Output={output}
            $/1M tokens{' '}
          </p>
          <hr className="my-2" />
          <p>Costs of the last call: {costState.costOfLastCall}$</p>
          <p>Input tokens of last call: {costState.inputTokensOfLastCall}</p>
          <p>Output tokens of last call: {costState.outputTokensOfLastCall}</p>
          <hr className="my-2" />
          <p>Costs for the current session: {costState.cost}$</p>
          <p>Input tokens of current session: {costState.inputTokens}</p>
          <p>Output tokens of current session: {costState.outputTokens}</p>
        </FlexItem>
        <FlexItem>
          <div className="overflow-x-auto">
            <Heading>Response from Backend</Heading>
            {fetchContent.isPending ? <Spinner /> : null}
            <Heading as="h2" size="4">
              Content
            </Heading>
            <pre>{JSON.stringify(outputContent, null, 2)}</pre>
            <Heading as="h2" size="4">
              OpenAI Response
            </Heading>
            <pre>{JSON.stringify(openAIResponse, null, 2)}</pre>
          </div>
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

function toText(obj: unknown): string {
  if (Array.isArray(obj)) {
    return obj.map(toText).join('')
  } else if (typeof obj === 'object' && obj != null) {
    if ('text' in obj && typeof obj['text'] === 'string') {
      return obj.text
    }

    return Object.values(obj).map(toText).join('')
  } else {
    return ''
  }
}

function getPrice(model: Model) {
  switch (model) {
    case Model.GPT_4O:
      return { input: 5, output: 15 }
    case Model.GPT_4O_MINI:
      return { input: 0.15, output: 0.6 }
    case Model.GPT_3_5_TURBO:
      return { input: 0.5, output: 1.5 }
    case Model.GPT_4:
      return { input: 30, output: 60 }
    case Model.GPT_4_TURBO:
      return { input: 10, output: 30 }
  }
}
