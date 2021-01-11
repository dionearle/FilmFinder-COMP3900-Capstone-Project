import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { AuthenticationService } from './authentication.service';
import { AuthGuardService } from './auth-guard.service';
import { SearchComponent } from './search/search.component';
import { MovieDetailsComponent} from './details/movieDetails.component';
import { AdminComponent} from './admin/admin.component';
import { WishlistComponent} from './wishlist/wishlist.component';
import { DirectorCastComponent} from './director-cast/director-cast.component';
import { CreationComponent } from './groups/createGroup.component';
import { GroupPageComponent } from './groups/groupPage.component';
import { FeedComponent } from './groups/feed.component';
import { SearchGroupComponent } from './search/searchGroup.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService] },
  { path: 'search', component: SearchComponent },
  { path: 'movieDetails', component: MovieDetailsComponent},
  { path: 'admin', component: AdminComponent },
  { path: 'wishlist', component: WishlistComponent}, 
  { path: 'directorCast', component: DirectorCastComponent},
  { path: 'createGroup', component: CreationComponent},
  { path: 'groupPage', component: GroupPageComponent},
  { path: 'searchGroup', component: SearchGroupComponent},
  { path: 'feed', component: FeedComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    SearchComponent,
    MovieDetailsComponent,
    AdminComponent,
    WishlistComponent,
    DirectorCastComponent,
    CreationComponent,
    GroupPageComponent,
    SearchGroupComponent,
    FeedComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
  ],
  providers: [
    AuthenticationService, 
    AuthGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
