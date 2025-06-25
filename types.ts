export interface TranslatorLanguage {
	code: string
	name: string
	native_name: string
	popularity?: number
	flag_country?: string[]
}

export interface TranslateRequestBody {
	text: string
	from_lang?: string
	to_lang?: string
	context?: string
}

export interface TranslateServiceResponse {
	text: string
	translated: string
	translations?: TranslateServiceResponse[]
	t?: string // legacy field for single translation
}
