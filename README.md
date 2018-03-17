![www.laatukiikut.fi](./2018/resources/images/poster/laatukiikut_poster.png)

# Laatukiikut.fi

Finnish forests are full of boulders and boulder problems. Obviously, some of these boulder problems are more spectacular than others and we, as climbers, do our best to find and climb them. The goal of *Laatukiikut.fi* is to help climbers to find the best and most suitable boulder problems Finland has to offer.

## Data Collection

The data used in *Laatukiikut.fi* is collected annually ([2018](https://docs.google.com/spreadsheets/d/1ftGzaWbpn-OqPdOQDv1STRl55IsfR0YS5_sn2hrJm4Y/edit?usp=sharing) and [2017](https://docs.google.com/spreadsheets/d/1yhoBNVjLgMF-ZNEmWwRCMHTRBEhcC4VrDVCqeq-VkKc/edit?usp=sharing)) through an online survey. This data is OPEN DATA and licensed under a [Creative Commons Attribution 4.0 International License (CC BY 4.0)](http://creativecommons.org/licenses/by/4.0/).

## Data Wrangling

The `/2018/data_wrangling/` folder contains two Jupyter Notebook files that are used for data wrangling, i.e., to clean, transform, and enrich the raw survey data. Before running the Jupyter Notebook files, you should first install, create and activate a Python virtual environment using, for example, [virtualenv](https://virtualenv.pypa.io/en/stable/). After doing so, install required Python packages:
```console
$ pip install -r requirements.txt
```

Finally, Jupyter Notebook can be started by executing the following command:
```console
$ jupyter notebook
```

Remember to fill in your own Google Maps JavaScript API key in `Create Boulders Final.ipynb`. In case you are wondering how to get one, please follow the instructions at <https://developers.google.com/maps/documentation/javascript/get-api-key>.
```console
GOOGLE_MAPS_JAVASCRIPT_API_KEY = "YOUR_API_KEY"
```

## Web Development

First, replace the existing Google Maps JavaScript API key in `/2018/index.html` and `/2017/index.html` with your own:
```console
https://maps.googleapis.com/maps/api/js?v=3&key=YOUR_API_KEY&language=fi&region=FI
```

Next, start a simple web server in order to run the website locally:
```console
$ python -m http.server
```

After starting the web server, the website can be accessed at `http://localhost:8000/`.

## Technologies

* **Data wrangling** - [Python 3](https://www.python.org/) & [Jupyter Notebook](http://jupyter.org/) + third-party libraries and services: [pandas](http://pandas.pydata.org/), [NumPy](http://www.numpy.org/), [geopy](https://github.com/geopy/geopy)
* **Web development** - HTML, CSS, JavaScript + third-party libraries and services: [Google Maps](https://developers.google.com/maps/documentation/javascript/), [MarkerClusterPlus](https://github.com/mahnunchik/markerclustererplus), [OverlappingMarkerSpiderfier](https://github.com/jawj/OverlappingMarkerSpiderfier), [Bootstrap](https://getbootstrap.com/), [jQuery](https://jquery.com/), [Google Fonts](https://fonts.google.com/), [Fontastic](http://fontastic.me/), [noUiSlider](https://refreshless.com/nouislider/), [Papa Parse](https://www.papaparse.com/), [wNumb](https://refreshless.com/wnumb/)

## Authors

* **Markku Laine** - idea, data collection, data wrangling, web development
* **Jussi Leskinen** - icons

## License

[MIT License](https://opensource.org/licenses/MIT)

Copyright (c) 2016-2018, Markku Laine

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.