import {afterNextRender, Component, computed, effect, EffectRef, inject, Injector, signal} from '@angular/core';
import {CoursesService} from "../services/courses.service";
import {Course, sortCoursesBySeqNo} from "../models/course.model";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {CoursesCardListComponent} from "../courses-card-list/courses-card-list.component";
import {MatDialog} from "@angular/material/dialog";
import {MessagesService} from "../messages/messages.service";
import {catchError, from, throwError} from "rxjs";
import {toObservable, toSignal, outputToObservable, outputFromObservable} from "@angular/core/rxjs-interop";
import { CoursesServiceWithFetch } from '../services/courses-fetch.service';
import { openEditCourseDialog } from '../edit-course-dialog/edit-course-dialog.component';
import { LoadingService } from '../loading/loading.service';

type Counter = {
    value: number;
}

@Component({
    selector: 'home',
    imports: [
        MatTabGroup,
        MatTab,
        CoursesCardListComponent
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {

    coursesService = inject(CoursesService);
    dialog = inject(MatDialog);

    courses = signal<Course[]>([]);
    begginerCourses = computed(() => {
        const courses = this.courses();
        return courses.filter(course => course.category === 'BEGINNER');
    });
    advancedCourses = computed(() => {
        const courses = this.courses();
        return courses.filter(course => course.category === 'ADVANCED');
    });
    loadingService = inject(LoadingService);
    messageService = inject(MessagesService);


    constructor() {

        effect(() => {
            console.log('Begginers: ', this.begginerCourses());
            console.log('Advanced: ', this.advancedCourses());
        });

        this.loadCourses().then(() => console.log('All courses loaded', this.courses()));
        
    }
    

    async loadCourses() {
        try {
            const courses = await this.coursesService.loadAllCourses();
            this.courses.set(courses.sort(sortCoursesBySeqNo));
            
        } catch (error) {
            this.messageService.showMessage('Error loading courses!', 'error');
        } 
    }


    onCourseUpdated(updaetdCourse: Course) {
        const courses = this.courses();
        const newCourses = courses.map(course => (
            course.id === updaetdCourse.id ? updaetdCourse : course
        ));
        this.courses.set(newCourses);
        this.messageService.showMessage('Updated course', 'success');
    }

   async onCourseDeleted(courseId: string) {
        try {
            await this.coursesService.deleteCourse(courseId);
            const courses = this.courses();
            const newCourses = courses.filter(course => course?.id !== courseId);
            this.courses.set(newCourses);
        } catch (error) {
            this.messageService.showMessage('Error deleting course', 'error');
        }
    }

    async onAddCourse() {
        const newCourse = await openEditCourseDialog(this.dialog, {
            mode: 'create',
            title: 'Create New Course',
        });
        const newCourses = [
            ...this.courses(),
            newCourse
        ];
        this.courses.set(newCourses);
        this.messageService.showMessage('New course created', 'success');
    }


}
