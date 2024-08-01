import { Card, Flex, Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'

export default function Home() {
  return (
    <Theme>
      <main className="p-5">
        <Flex gap="3">
          <FlexItem>Serlo Editor</FlexItem>
          <FlexItem>Settings</FlexItem>
          <FlexItem>Final Editor</FlexItem>
        </Flex>
      </main>
    </Theme>
  )
}

function FlexItem({ children }: { children: React.ReactNode }) {
  return <Card className="min-w-80 w-1/3">{children}</Card>
}
