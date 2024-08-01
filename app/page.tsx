'use client'

import { Button, Card, Flex, Heading, Theme } from '@radix-ui/themes'
import * as Form from '@radix-ui/react-form'
import '@radix-ui/themes/styles.css'
import { SerloEditor, SerloEditorProps, SerloRenderer } from '@serlo/editor'
import React from 'react'

const initialState = {
  plugin: 'rows',
  state: [{ plugin: 'text' }],
}

export default function Home() {
  const [inputContent, setInputContent] = React.useState<Content>(initialState)
  const [outputContent, setOutputContent] =
    React.useState<Content>(initialState)
  const [prompt, setPrompt] = React.useState('Vereinfache den Text')

  const generateContent = async () => {
    setOutputContent(inputContent)
  }

  return (
    <Theme>
      <main className="p-5">
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
            </Form.Root>
            <Button onClick={generateContent}>Generate Content with AI</Button>
          </FlexItem>
          <FlexItem>
            <Heading>Output of the generative AI</Heading>
            <SerloRenderer document={outputContent} />
          </FlexItem>
        </Flex>
      </main>
    </Theme>
  )
}

function FlexItem({ children }: { children: React.ReactNode }) {
  return <Card className="min-w-[600px] w-1/3">{children}</Card>
}

type Content = SerloEditorProps['initialState']
