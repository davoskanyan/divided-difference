import { Provider } from '@react-spectrum/s2'
import App from './App'


export function AppRoot() {
  return (
    <Provider background="base">
      <App />
    </Provider>
  )
}
