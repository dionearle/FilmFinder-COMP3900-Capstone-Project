import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    templateUrl: './searchGroup.component.html'
})

export class SearchGroupComponent {

    constructor(private http: HttpClient, private Activatedroute: ActivatedRoute, private router: Router) { }

    name = this.Activatedroute.snapshot.queryParamMap.get('name');

    results;

    ngOnInit() {
        // need to get the search results
        this.http.get('/api/searchGroup', { params: { name: this.name } }).subscribe((results) => {
            this.results = results;
        })
    }

    // once the name of the group has been selected
    // route to the groups page 
    details(groupName: string) {
        this.router.navigate(['/groupPage'], { queryParams: { name: groupName } });
    }
}