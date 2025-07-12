import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  public async index({ inertia }: HttpContext) {
    return inertia.render('home', {
      title: 'Home',
      description: 'Welcome to the home page of the web admin application.',
    })
  }
}
