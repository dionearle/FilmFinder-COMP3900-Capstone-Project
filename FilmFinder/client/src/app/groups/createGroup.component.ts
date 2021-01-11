import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

interface Group {
    creator: string;
    name: string;
    description: string;
}

@Component({
    templateUrl: './createGroup.component.html'
})

export class CreationComponent {

    // set up the initial fields for the group
    currentGroup: Group = {
        creator: '',
        name: '',
        description: ''
    }

    createStatus = true;

    constructor(public auth: AuthenticationService, private http: HttpClient, private router: Router) { }

    // called when the user fills in the create group form
    create(groupForm: NgForm) {

        this.createStatus = true;

        if (!this.empty()) {

            this.currentGroup.creator = this.auth.getUserDetails()._id;

            // call to post the group
            this.http.post(`/api/createGroup`, this.currentGroup).subscribe((group: any) => {

                let params = new HttpParams();
                params = params.append('groupId', group._id);
                params = params.append('userId', this.auth.getUserDetails()._id);

                this.http.get('/api/addMember', { params: params }).subscribe(() => {
                    this.router.navigate(['/groupPage'], { queryParams: { name: this.currentGroup.name } });
                });
            }, (err) => {
                this.createStatus = false;
            });
        }
    }

    empty(): boolean {
        if (this.currentGroup.name != '' && this.currentGroup.description != '') {
            return false;
        }
        return true;
    }
}