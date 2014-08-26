# Class file for our Isochrone manipulation
class IsochroneController < ApplicationController
  # We don't want a layout for this API. Plus, JSON only.
  respond_to :json
  layout false

  # Generate Method
  def generate
    # Was this request from AJAX?
    #if request.xhr?
    #  render :json => {
    #    :text => params[:title],
    #    :lol => params[:title]
    #  }
    #end

    #respond_to do |format|
    #  format.json {
        render :json => {
          :id => "001",
          :name => "some isochrone",
          :points => [
            :point_x => {
              :lat => "111",
              :lng => "222"
            },
            :point_y =>
            {
              :lat => "333",
              :lng => "444"
            }
          ]
        }
    #  }
    #end
  end
end
