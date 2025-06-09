import { Registro } from '../../shared/constants/registro.model';
import { CRMData } from './crm.model';

export interface CRMRegistro extends Registro {
  crmData?: CRMData;
}