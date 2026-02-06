import * as fs from 'node:fs/promises'
import { DigiflazzService } from '../src'
import type { Cookie } from '../src/digiflazz.type'

const main = async () => {
  const cookies = await fs.readFile('./cookies.json', 'utf-8')
  const parsedCookies: Cookie[] = JSON.parse(cookies)

  const digiflazz = new DigiflazzService(parsedCookies)
  await digiflazz.initialize()
  const categories = await digiflazz.getProductCategory()
  console.log(categories)
}

main()
