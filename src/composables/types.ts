import { API_FIELD_TEXT, API_FIELD_CTX, API_FIELD_FROM, API_FIELD_TO } from '../constants'

export interface BatchRequest {
  [API_FIELD_TEXT]: string
  [API_FIELD_CTX]: string
  [API_FIELD_FROM]: string
  [API_FIELD_TO]: string
  cacheKey: string
}
