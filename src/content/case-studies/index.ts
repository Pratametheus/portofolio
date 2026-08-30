import type {CaseStudy, Locale} from '../types';
import {siakadInformatika} from './siakad-informatika';
import {cityCourier} from './city-courier';
import {mochitoon} from './mochitoon';

export const caseStudies: Record<Locale, CaseStudy[]> = {
  id: [siakadInformatika.id, cityCourier.id, mochitoon.id],
  en: [siakadInformatika.en, cityCourier.en, mochitoon.en]
};
