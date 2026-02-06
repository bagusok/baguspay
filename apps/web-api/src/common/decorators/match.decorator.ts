import type { ClassConstructor } from 'class-transformer'
import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator'

type Tfn<T> = (o: T) => any

export const Match = <T>(
  _type: ClassConstructor<T>,
  property: Tfn<T>,
  validationOptions?: ValidationOptions,
) => {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint<T>,
    })
  }
}

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint<T> implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [fn] = args.constraints as Tfn<T>[]
    return fn(args.object as T) === value
  }
}
