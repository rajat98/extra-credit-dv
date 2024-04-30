# Homework #3: D3 Transitions

In this homework, you'll apply knowledge about D3 transitions and joins to create a linked scatter plot and animated box plot. [Boxplots](https://shiny.ovpr.uga.edu/iblir/Lab3/#section-introduction) (sometimes called box-and-whisker plots) show summary statistics about a quantitative attribute. Your box plot will be linked to the scatter plot via lasso interactions. That is, when a user lassos a selection of data points in the scatter plot, the box plot will be drawn (or updated) using D3-based animations.

This assignment is worth 10 points. It will include the following aspects:

- Create a page with a control panel to hold a set of required HTML controls and two visualization panels to hold your scatter plot and box plot.
- A user can select a dataset from a dropdown. We will give you two starting datasets, but we'll also grade using a third and fourth (hidden) dataset, so you'll need to code your logic in a way that dynamically supports loading and parsing datasets and their attributes.
- Draw the currently selected dataset and attributes in the scatter plot.
- When the user lassos a selection of points in the scatter plot, draw (or update) the box plot panel to show summary statistics about the selected points.

We don't give you any starter code for this assignment: you'll have to create everything from scratch, including making the `index.html` page. You have the freedom to stylize your chart (and webpage) as desired, though points will be deducted for sloppy design (in other words, you should apply good principles of styling, UI, and UX design that we have been teaching in lectures).

> ❗️ This homework asks you to perform very specific animations and interactions. Be sure to carefully read the steps below!

> ❗️ As always, the sharing and copying code with other students is considering cheating, as is using ChatGPT, Coding co-pilots, or other generative AI. Passing off (part of) a codebase from someone else as your own is also plagiarism.

## Step 1: Create your initial page

Name your html file `index.html`. Create three panels on your page: one will be a control panel, one will hold the scatter plot, and one will hold the box plots. The exact layout and sizing is up to you, but I recommend you make your overall page no wider than ~1400-1920 px. (It's fine if you have to scroll to see everything.) At the top of the page, add a title for the homework, your name, and an email (similar to prior homeworks).

For this assignment, you will store your CSS and Javascript code in their own files, naming the files with your ASURITE. For example, I would name my files `cbryan16.css` and `cbryan16.js`, and link to them from my `index.html`.

## Step 2: Create your control panel and Import the Datasets


The control panel should have the following controls (though you can add additional controls if you want) with appropriate labeling.

- **Dataset**: A `select` that lets you pick the dataset to import and show. 
- **X Attribute**: A `select` that shows all quantitative attributes in the currectly selected dataset. Picking an option here will update the scatter plot's x-axis and data points accordingly.
- **Y Attribute**: A `select` that shows all quantitative attributes in the currectly selected dataset. Picking an option here will update the scatter plot's y-axis plot accordingly.
- **Color**: A `select` that shows all categorical attributes in the currently selected dataset. Picking an option here will update the attribute used to color the data points in the scatter plot. 
- **Boxplot**: A `select` that shows all quantitative attributes in the currently selected dataset. The selected option here will be what is shown in the box plot.


Download the following two starter datasets to your repository --- [Penguins Cleaned](https://github.com/dataprofessor/data/blob/master/penguins_cleaned.csv) and [Pokemon with stats](https://www.kaggle.com/datasets/abcsds/pokemon) --- and add them as options in the **Dataset** dropdown. In that dropdown, you should also add two additional selection options for the "Test1" and "Test2" testing datasets (available only to the graders, not to you), which will be located at the URLs `/testing/data/Test1.csv` and `/testing/data/Test2.csv`. 

> 👋 In the Pokemon dataset, you can ignore the following columns: `#`, `Name`, and `Type 2`.

For the purposes of this assignment, you may assume that all dataset attributes will be either _categorical_ (strings with alphanumeric values) or _quantitative_ (i.e., numbers). Keep in mind that quantitative attributes might contain negative values.

For the **Color** dropdown, you should pick (or implement a manual) color scale with at least 8 color hues. D3 provides severeal pre-built color scales you can use ([link](https://d3js.org/d3-scale-chromatic/categorical)). If you select an attribute in the **Color** dropdown with a cardinality that is higher than your color scale's range, it is okay if the scale starts repeating colors (this is D3's default behavior for categorical color scales). 

> 😎 Keep in mind that you should make your page design look nice, so pay attention to thing like consistent styling, application of Gestalt principles, and organizing things nicely.

## Step 3: Create the Scatter Plot and Lasso

Create and draw a scatter plot that updates based on the selections in the control panel. The exact styling of the chart is up to you, but make it look nice and be sure to include axes (with labels) that also update as you change the selections in the control panel. You should also add a color key based on the currently selected attribute values in the **Color** dropdown, that updates when that attribute is updated.

> 🤔 Where is the best place to put your color key? If it sits on top of your scatter plot's drawing area, will it block points in the scatter plot?

When a user updates **Dataset** dropdown, update the **X, Y,** and **Color** dropdowns accordingly (i.e., with approprpiate attribute options based on the updated dataset), and re-draw the scatter plot (including axes) with the updated dataset (you can use the first option in each `select` as initializing values).

You should also implement a lasso on the scatter plot. The exact implementation and styling for this is up to you (and there's several examples of lasso implementations online you might like to reference: [example1](https://stackoverflow.com/questions/64107576/lasso-plugin-wont-work-with-d3-upgrade-to-v6) (see Jan 26, 2023 answer, which works well but has rather rudimentary styling), [example2](https://observablehq.com/@fil/lasso-selection), [example3](https://observablehq.com/d/169d5c4e08b83ac1). Keep in mind all your code should use D3.v7 code. 
- When you lasso around a set of data points in the scatter plot, you should implmenet a way to visually indicate which data points are currently selected. For example, you could add a border to the points, slighly increase their size, or de-emphaize the other (unselected) points on the chart in some way. (It is up to you if you want to erase the lasso polyline upon the user releasing the mouse, or if you want to keep it on the chart until the next lasso is drawn/cleared.)
- If the user just clicks the mouse on the scatter plot without lassoing points, that should be a way to should de-select all the points or clear the lasso selection.
- When the user lassos a set of points on the scatter plot, this should trigger a function to draw (or update) the box plot chart, based on the set of selected points.

## Step 4: Draw the Box Plot

For the set of selected points, first group them based on their colors (i.e., the attribute values in the **Color** dropdown), and then compute the summary statistics for each of these groups based on the attribute selected in the **Box Plot** dropdown. (Summary statistics include min/max, quartiles, mean or median, and potentially outliers, depending on where you set the thresholds of your whiskers. Here's a page showing how to compute these: [link](https://observablehq.com/@d3/box-plot/2?intent=fork)) You will create one box-and-whisker for each of groups, and also create an axis (with label) to indicate the data min/max range. Your box plot axis be based on the overall min-to-max of all data points in the dataset for the selected attribute, and only needs to be updated when the **Dataset** or **Box Plot** selections are changed (see below). Also add a text label or annotation for each of the groups in the box plot.

> 🤔 If you have several boxes that are being shown, make sure your labels don't overlap!

Like the scatter plot, the exact styling of your box plot is up to you. There's lots of ways to style a box plot,including ways that show [_all_ points](https://d3-graph-gallery.com/graph/boxplot_horizontal.html) in each box-and-whisker with jitter (i.e., not just outliers)! You're also allowed to arrange boxplots either horizontally or vertically. I recommend you compute the thickness of each box-and-whisker based on the total number of potential groups for the currently selected attribute. If a group is empty based on the current lasso selection, you can either leave a blank space or add some cue/label to indicate the group is empty. (Likewise, think about how you would handle instances when only a couple of points are in a group; generally you need at least ~5 points to be able to compute your statistics. If you have 4 or fewer, you could just show the individual data points.) Likewise, if you only have a couple of groups for the current attribute (e.g., the `sex` attribute in the `penguins` dataset), it's also fine to set a maximium thickness for each box-and-whisker, so they don't look cartoonishly wide.

I'd also recommend incorporating group colors into the box-and-whiskers (i.e., the same colors as from the scatter plot) to make it easier for your users to associate group statistics to the individual data points in the scatter plot.

When the user interacts with the control panel or scatter plot, you will use [D3 joins](https://observablehq.com/@d3/selection-join) to update your box plot according to the following animations:
- When a box-and-whisker needs to be updated, use a staged (or staggered) transition to update it ([here's an example](https://d3-graph-gallery.com/graph/interactivity_transition.html)):     
    - if outliers are currently being shown, first fade these out to make them disappear
    - once this is done, then animate the whiskers from their old-to-new positions
    - once this is done, animate the box and median line from their old-to-new positions
    - once this is done, if new outliers need to be added, fade them in
- If a box-and-whisker becomes "empty" (i.e., the box-and-whisker was previously being drawn, but is now NOT being drawn), you should "shrink" it by reducing its size to 0. Before shrinking it, first fade out any outlier data points (similar to the above bullet point) to make them disappear; once this is done, then do the shrinking.
- If a box-and-whisker goes from "empty" to "non-empty" (i.e., the box-and-whisker was previously not being drawn, but should now be drawn), first "grow" its size from 0 to whatever it should be. After the growing is finished, fade in any outlier points using a staged transition.
- When multiple box-and-whiskers need to be updated, you should not animate them all at the same time (i.e., starting at the same time and all animating exactly in parallel). Instead, use `delays` to stagger the start times the individual box-and-whiskers (with a properly implemented staged transition, the subsequent stages should also be appropriately delayed).

> 😎 One way to do your "shrinks" and "grows" is to manipulate the size of the box plot via transitions: e.g., for a shrink, animate the size to 0 and then erase the box plot; for a grow, draw the box plot with size 0 and then animate to whatever its correct "end" size is. 

If the user draws an empty lasso selection in the scatter plot (or clears the selection), you should shrink all of the box-and-whiskers using the "shrink" transition. Likewise, if all the box plots are empty and they draw a new selection, they'll all need to be "grown" using the above-described transition. If the user changes any value in the **Dataset**, **X Attribute**, **Y Attribute**, **Color**, or **Box Plot**, it is okay to clear the lasso selection in the scatter plot, which will shrink and box-and-whiskers in this plot using the "shrink" transition.

> 🤔 What do you do with the box plot's axis (and label) in the box plot when the **Dataset** or **Box Plot** selection is changed? You will need to update it (or erase it and re-draw it later), but how you specifically handle it is up to you, so think about how to do so in a way that supports a good overall UX.

Finally, you should also have some sort of text label or annotation in the scatter plot or box plot panel that indicates how many data points have been selected (you only need to indicate the total number of points; you don't have to indicate how many are selected in each group if you don't want to).

## Extra Credit Opportunities

There are three ways you can potentially receive extra credit for this assignment. A maximum of 3 extra credit points can be added to this assignment.

- When the user changes how attributes are shown in the scatter plot, instead of erasing and re-drawing the points, animate them from their old locations to new locations (likewise, animate the axis that is being updated, in parallel with the points). (+1)
- When the user changes between datasets, instead of simply erasing/redrawing the dataset in the scatter plot, use D3 animations to make this change look nicer or poppier (e.g., via fade out/ins, or flying in the points from offscreen, etc.). (+1)
- Add a control in your control panel that lets the user toggle between showing the box plot and a violin plot in the box plot panel. When clicked, you should animate the box plot's box into the violin plot's kernel density plot (or vice versa). The specifics of the violin plot encodings and styling are up to you, but make it look nice (e.g., do you want to keep the whiskers or remove them? if you remove them, should you use an animation to do so?). You'll likely find D3's [shape tweening](https://observablehq.com/@d3/shape-tweening) functions helpful for this. (+2)