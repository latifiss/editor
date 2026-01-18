import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import afrobeatsrepArticleReducer from '../features/afrobeatsrep/article/articleSlice';
import ghanapolitanSectionReducer from '../features/ghanapolitan/section/sectionSlice';
import graphicReducer  from '../features/ghanapolitan/graphic/graphicSlice';

import { authApi } from '../features/auth/authAPI';
import { afrobeatsrepArticleApi } from '../features/afrobeatsrep/article/articleAPI';
import { afeatureApi } from '../features/afrobeatsrep/feature/featureAPI';

import { featureApi as ghanascoreFeatureApi } from '../features/ghanascore/feature/featureAPI';
import { articleApi as ghanascoreArticleApi } from '../features/ghanascore/article/articleAPI';

import { ghanapolitanArticleApi } from '../features/ghanapolitan/articles/articleAPI';
import { ghanapolitanFeatureApi } from '../features/ghanapolitan/feature/featureAPI';
import { opinionApi as ghanapolitanOpinionApi } from '../features/ghanapolitan/opinion/opinionAPI';
import { ghanapolitanSectionApi } from '../features/ghanapolitan/section/sectionApi';
import { graphicApi  } from '../features/ghanapolitan/graphic/graphicAPI'; 

const rootReducer = combineReducers({
  auth: authReducer,
  afrobeatsrepArticle: afrobeatsrepArticleReducer,
  ghanapolitanSectionOpinion: ghanapolitanSectionReducer,
  graphic: graphicReducer,
  
  [authApi.reducerPath]: authApi.reducer,
  [afrobeatsrepArticleApi.reducerPath]: afrobeatsrepArticleApi.reducer,
  [afeatureApi.reducerPath]: afeatureApi.reducer,
  
  [ghanascoreFeatureApi.reducerPath]: ghanascoreFeatureApi.reducer,
  [ghanascoreArticleApi.reducerPath]: ghanascoreArticleApi.reducer,
  
  [ghanapolitanArticleApi.reducerPath]: ghanapolitanArticleApi.reducer,
  [ghanapolitanFeatureApi.reducerPath]: ghanapolitanFeatureApi.reducer,
  [ghanapolitanOpinionApi.reducerPath]: ghanapolitanOpinionApi.reducer,
  [ghanapolitanSectionApi.reducerPath]: ghanapolitanSectionApi.reducer,
  [graphicApi.reducerPath]: graphicApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;