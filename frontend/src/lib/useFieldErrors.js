import { useState } from 'react';

/**
 * Field errors that clear themselves once the user changes that field.
 * `values` is the form state; an error stays only while its field still holds
 * the value it had when the error was raised. Keys that aren't form fields
 * (group-level errors) are kept until the next validation.
 */
export function useFieldErrors(values) {
  const [state, setState] = useState({ errors: {}, at: values });
  const errors = {};
  for (const [key, message] of Object.entries(state.errors)) {
    if (!(key in values) || values[key] === state.at[key]) errors[key] = message;
  }
  return [errors, (next) => setState({ errors: next, at: values })];
}
