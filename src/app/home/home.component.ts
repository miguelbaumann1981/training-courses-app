import {afterNextRender, Component, computed, effect, EffectRef, ElementRef, inject, Injector, signal, viewChild} from '@angular/core';
import {CoursesService} from "../services/courses.service";
import {Course, sortCoursesBySeqNo} from "../models/course.model";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {CoursesCardListComponent} from "../courses-card-list/courses-card-list.component";
import {MatDialog} from "@angular/material/dialog";
import {MessagesService} from "../messages/messages.service";
import {catchError, from, interval, startWith, throwError} from "rxjs";
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
        CoursesCardListComponent,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {

    coursesService = inject(CoursesService);
    dialog = inject(MatDialog);

    #courses = signal<Course[]>([]);
    begginerCourses = computed(() => {
        const courses = this.#courses();
        return courses.filter(course => course.category === 'BEGINNER');
    });
    advancedCourses = computed(() => {
        const courses = this.#courses();
        return courses.filter(course => course.category === 'ADVANCED');
    });
    loadingService = inject(LoadingService);
    messageService = inject(MessagesService);
    begginersList = viewChild('begginersList', {
        read: ElementRef
    });

    


    constructor() {

        effect(() => {
            // console.log(this.begginersList());
        })

        effect(() => {
            // console.log('Begginers: ', this.begginerCourses());
            // console.log('Advanced: ', this.advancedCourses());
        });

        this.loadCourses().then(() => console.log('All courses loaded', this.#courses()));
        
    }
    

    async loadCourses() {
        try {
            const courses = await this.coursesService.loadAllCourses();
            this.#courses.set(courses.sort(sortCoursesBySeqNo));
            
        } catch (error) {
            this.messageService.showMessage('Error loading courses!', 'error');
        } 
    }


    onCourseUpdated(updaetdCourse: Course) {
        const courses = this.#courses();
        const newCourses = courses.map(course => (
            course.id === updaetdCourse.id ? updaetdCourse : course
        ));
        this.#courses.set(newCourses);
        this.messageService.showMessage('Updated course', 'success');
    }

   async onCourseDeleted(courseId: string) {
        try {
            await this.coursesService.deleteCourse(courseId);
            const courses = this.#courses();
            const newCourses = courses.filter(course => course?.id !== courseId);
            this.#courses.set(newCourses);
        } catch (error) {
            this.messageService.showMessage('Error deleting course', 'error');
        }
    }

    async onAddCourse() {
        const newCourse = await openEditCourseDialog(this.dialog, {
            mode: 'create',
            title: 'Create New Course',
        });
        if (!newCourse) {
            return;
        }
        const newCourses = [
            ...this.#courses(),
            newCourse
        ];
        this.#courses.set(newCourses);
        this.messageService.showMessage('New course created', 'success');
    }

    injector = inject(Injector);

    onToObservable() {
        const courses$ = toObservable(this.#courses, {
            injector: this.injector
        });
        courses$.subscribe(courses => console.log(courses));

        //------
        const numbers = signal(0);
        numbers.set(1);
        numbers.set(2);
        numbers.set(3);
        const numbers$ = toObservable(numbers, {
            injector: this.injector
        });
        numbers.set(4);
        numbers$.subscribe(value => console.log(value));
        numbers.set(5);
    }

    // courses$ = from(this.coursesService.loadAllCourses());
    onToSignalExample() {
        const courses$ = from(this.coursesService.loadAllCourses()).pipe(
            catchError(err => {
                console.log(err);
                throw err;
            })
        );
        const courses = toSignal(courses$, {
            injector: this.injector
        });
    
        effect(() => {
            console.log(courses())
        }, {
            injector: this.injector
        });

        //--------
        const number$ = interval(1000);
        const numbers = toSignal(number$, {
            injector: this.injector,
        });
        effect(() => {
            // console.log(numbers())
        }, {
            injector: this.injector
        });
    }


}
