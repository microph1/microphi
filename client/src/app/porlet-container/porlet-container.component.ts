import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-porlet-container',
  templateUrl: './porlet-container.component.html',
  styleUrls: ['./porlet-container.component.scss']
})
export class PorletContainerComponent implements OnInit {

  constructor(private route: ActivatedRoute) {
    route.data.subscribe((data) => {
      console.log('got data');
      const bundleUrl = data.bundleUrl;
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = bundleUrl;

      script.onerror = (error) => {
        // resolve({script: name, loaded: false, status: 'Loaded'});
        console.error(error);
      };

      document.getElementsByTagName('head')[0].appendChild(script);

    });

  }

  ngOnInit() {
    //load script
    // let script = document.createElement('script');
    // script.type = 'text/javascript';
    // script.src = this.scripts[name].src;
    // if (script.readyState) {  //IE
    //   script.onreadystatechange = () => {
    //     if (script.readyState === "loaded" || script.readyState === "complete") {
    //       script.onreadystatechange = null;
    //       this.scripts[name].loaded = true;
    //       resolve({script: name, loaded: true, status: 'Loaded'});
    //     }
    //   };
    // } else {  //Others
    //   script.onload = () => {
    //     this.scripts[name].loaded = true;
    //     resolve({script: name, loaded: true, status: 'Loaded'});
    //   };
    // }
    // script.onerror = (error: any) => resolve({script: name, loaded: false, status: 'Loaded'});
    // document.getElementsByTagName('head')[0].appendChild(script);
  }

}
