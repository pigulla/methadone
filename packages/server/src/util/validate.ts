import {validateSync, type ValidationError} from 'class-validator';
import {type ValidatorOptions} from 'class-validator/types/validation/ValidatorOptions';
import ExtendableError from 'ts-error';

// Unfortunately, class-validator's ValidationError does not extend Error, so we have to jump through some hoops here.
export class ObjectValidationError extends ExtendableError {
    public readonly className: string;
    public readonly validationErrors: ReadonlyArray<ValidationError>;

    public constructor(options: {
        className: string;
        validationErrors: Iterable<ValidationError>;
    }) {
        super(`An object of class ${options.className} has failed validation`);

        this.className = options.className;
        this.validationErrors = [...options.validationErrors];
    }
}

export function validate<T extends object>(
    object: T,
    validatorOptions: ValidatorOptions = {},
): T {
    const validationErrors = validateSync(object, {
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        ...validatorOptions,
    });

    if (validationErrors.length > 0) {
        throw new ObjectValidationError({
            className: object.constructor.name,
            validationErrors,
        });
    }

    return object;
}
