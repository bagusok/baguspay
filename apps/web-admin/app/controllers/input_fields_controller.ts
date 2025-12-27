import {
  connectInputFieldValidator,
  createInputFieldValidator,
  inputIdValidator,
  updateInputFieldValidator,
} from '#validators/input_field'
import type { HttpContext } from '@adonisjs/core/http'
import { and, db, desc, eq } from '@repo/db'
import { tb } from '@repo/db/types'
import vine from '@vinejs/vine'

export default class InputFieldsController {
  /**
   * Display a list of resource
   */
  async index(ctx: HttpContext) {
    const inputFields = await db.query.inputFields.findMany({
      orderBy: desc(tb.inputFields.created_at),
    })

    return ctx.inertia.render('input-fields/index', {
      title: 'Input Fields',
      description: 'Manage your input fields here.',
      inputFields,
    })
  }

  async postCreate(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(vine.compile(createInputFieldValidator))

    const transformedData = {
      ...data,
      options:
        data.options?.map((option) => ({
          ...option,
          value_checker_mapping: option.value,
        })) || null,
    }

    await db.insert(tb.inputFields).values(transformedData)

    ctx.session.flash({
      success: 'Input field created successfully.',
    })

    return ctx.response.redirect().toRoute('inputFields.index')
  }

  async postUpdate(ctx: HttpContext) {
    const id = ctx.params.id
    const data = await ctx.request.validateUsing(vine.compile(updateInputFieldValidator))

    const transformedData = {
      ...data,
      options:
        data.options?.map((option) => ({
          ...option,
          value_checker_mapping: option.value,
        })) || null,
    }

    await db.update(tb.inputFields).set(transformedData).where(eq(tb.inputFields.id, id))

    ctx.session.flash({
      success: 'Input field updated successfully.',
    })

    return ctx.response.redirect().toRoute('inputFields.index')
  }

  async postDelete(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(vine.compile(inputIdValidator), {
      data: ctx.request.params(),
    })

    await db.delete(tb.inputFields).where(eq(tb.inputFields.id, data.id))

    ctx.session.flash({
      success: 'Input field deleted successfully.',
    })

    return ctx.response.redirect().toRoute('inputFields.index')
  }

  async getAllInputFields(ctx: HttpContext) {
    const inputFields = await db.query.inputFields.findMany({
      orderBy: desc(tb.inputFields.created_at),
    })

    return ctx.response.json({
      data: inputFields,
    })
  }

  async postConnect(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(vine.compile(connectInputFieldValidator), {
      data: ctx.request.body(),
    })

    const existingConnection = await db.query.inputOnProductCategory.findFirst({
      where: and(
        eq(tb.inputOnProductCategory.input_field_id, data.input_field_id),
        eq(tb.inputOnProductCategory.product_category_id, data.product_category_id)
      ),
    })

    if (existingConnection) {
      ctx.session.flash({
        error: 'Input field is already connected to this product category.',
      })
      return ctx.response.redirect().toRoute('inputFields.index')
    }

    await db.insert(tb.inputOnProductCategory).values({
      input_field_id: data.input_field_id,
      product_category_id: data.product_category_id,
    })

    ctx.session.flash({
      success: 'Input field connected to product category successfully.',
    })
    return ctx.response.redirect().back()
  }

  async postDisconnect(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(vine.compile(inputIdValidator), {
      data: ctx.request.params(),
    })

    const connection = await db.query.inputOnProductCategory.findFirst({
      where: eq(tb.inputOnProductCategory.id, data.id),
    })

    if (!connection) {
      ctx.session.flash({
        error: 'Connection not found.',
      })
      return ctx.response.redirect().toRoute('inputFields.index')
    }

    await db.delete(tb.inputOnProductCategory).where(eq(tb.inputOnProductCategory.id, data.id))

    ctx.session.flash({
      success: 'Input field disconnected from product category successfully.',
    })
    return ctx.response.redirect().back()
  }
}
